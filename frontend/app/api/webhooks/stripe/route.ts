/**
 * API Route: Stripe Webhooks
 * POST /api/webhooks/stripe
 *
 * Handles Stripe webhook events for subscription management
 */

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { db } from "@/lib/firebase-admin";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20.acacia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      console.error("[Stripe Webhook] No signature provided");
      return NextResponse.json(
        { error: "No signature provided" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("[Stripe Webhook] Signature verification failed:", err);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    console.log(`[Stripe Webhook] Received event: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case "customer.subscription.trial_will_end":
        await handleTrialWillEnd(event.data.object as Stripe.Subscription);
        break;

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    // Return success response
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Stripe Webhook] Error processing webhook:", error);
    return NextResponse.json(
      {
        error: "Webhook processing failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Handle subscription created event
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const companyId = subscription.metadata.companyId;

  if (!companyId) {
    console.error("[Stripe Webhook] No companyId in subscription metadata");
    return;
  }

  console.log(`[Stripe Webhook] Creating subscription for company: ${companyId}`);

  await db.collection("companies").doc(companyId).update({
    subscription: {
      id: subscription.id,
      customerId,
      status: subscription.status,
      plan: subscription.items.data[0]?.price.id,
      planName: subscription.metadata.planName || "Unknown",
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      trialEnd: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      createdAt: new Date(subscription.created * 1000),
      updatedAt: new Date(),
    },
    subscriptionStatus: subscription.status,
    updatedAt: new Date(),
  });

  // Log subscription event
  await db.collection("auditLog").add({
    companyId,
    action: "subscription_created",
    timestamp: new Date(),
    metadata: {
      subscriptionId: subscription.id,
      plan: subscription.metadata.planName,
      status: subscription.status,
    },
  });
}

/**
 * Handle subscription updated event
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const companyId = subscription.metadata.companyId;

  if (!companyId) {
    console.error("[Stripe Webhook] No companyId in subscription metadata");
    return;
  }

  console.log(`[Stripe Webhook] Updating subscription for company: ${companyId}`);

  await db.collection("companies").doc(companyId).update({
    "subscription.status": subscription.status,
    "subscription.currentPeriodStart": new Date(subscription.current_period_start * 1000),
    "subscription.currentPeriodEnd": new Date(subscription.current_period_end * 1000),
    "subscription.cancelAtPeriodEnd": subscription.cancel_at_period_end,
    "subscription.updatedAt": new Date(),
    subscriptionStatus: subscription.status,
    updatedAt: new Date(),
  });

  // Log subscription update
  await db.collection("auditLog").add({
    companyId,
    action: "subscription_updated",
    timestamp: new Date(),
    metadata: {
      subscriptionId: subscription.id,
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });
}

/**
 * Handle subscription deleted event
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const companyId = subscription.metadata.companyId;

  if (!companyId) {
    console.error("[Stripe Webhook] No companyId in subscription metadata");
    return;
  }

  console.log(`[Stripe Webhook] Deleting subscription for company: ${companyId}`);

  await db.collection("companies").doc(companyId).update({
    "subscription.status": "canceled",
    "subscription.canceledAt": new Date(),
    "subscription.updatedAt": new Date(),
    subscriptionStatus: "canceled",
    accountActive: false, // Disable account features
    updatedAt: new Date(),
  });

  // Log subscription cancellation
  await db.collection("auditLog").add({
    companyId,
    action: "subscription_canceled",
    timestamp: new Date(),
    metadata: {
      subscriptionId: subscription.id,
      reason: "subscription_deleted",
    },
  });

  // TODO: Send email notification to company admin
}

/**
 * Handle successful payment event
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) {
    console.log("[Stripe Webhook] No subscription ID in invoice");
    return;
  }

  // Find company by subscription ID
  const companiesSnapshot = await db
    .collection("companies")
    .where("subscription.id", "==", subscriptionId)
    .limit(1)
    .get();

  if (companiesSnapshot.empty) {
    console.error("[Stripe Webhook] No company found for subscription:", subscriptionId);
    return;
  }

  const companyDoc = companiesSnapshot.docs[0];
  const companyId = companyDoc.id;

  console.log(`[Stripe Webhook] Payment succeeded for company: ${companyId}`);

  // Update payment history
  await db.collection("companies").doc(companyId).update({
    "subscription.lastPaymentDate": new Date(invoice.created * 1000),
    "subscription.lastPaymentAmount": invoice.amount_paid,
    "subscription.updatedAt": new Date(),
    subscriptionStatus: "active",
    accountActive: true,
    updatedAt: new Date(),
  });

  // Log payment event
  await db.collection("auditLog").add({
    companyId,
    action: "payment_succeeded",
    timestamp: new Date(),
    metadata: {
      invoiceId: invoice.id,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      subscriptionId,
    },
  });

  // TODO: Send payment receipt email
}

/**
 * Handle failed payment event
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) {
    console.log("[Stripe Webhook] No subscription ID in invoice");
    return;
  }

  // Find company by subscription ID
  const companiesSnapshot = await db
    .collection("companies")
    .where("subscription.id", "==", subscriptionId)
    .limit(1)
    .get();

  if (companiesSnapshot.empty) {
    console.error("[Stripe Webhook] No company found for subscription:", subscriptionId);
    return;
  }

  const companyDoc = companiesSnapshot.docs[0];
  const companyId = companyDoc.id;

  console.log(`[Stripe Webhook] Payment failed for company: ${companyId}`);

  // Update subscription status
  await db.collection("companies").doc(companyId).update({
    "subscription.paymentStatus": "failed",
    "subscription.lastPaymentError": invoice.last_finalization_error?.message || "Payment failed",
    "subscription.updatedAt": new Date(),
    subscriptionStatus: "past_due",
    updatedAt: new Date(),
  });

  // Log payment failure
  await db.collection("auditLog").add({
    companyId,
    action: "payment_failed",
    timestamp: new Date(),
    metadata: {
      invoiceId: invoice.id,
      amount: invoice.amount_due,
      subscriptionId,
      error: invoice.last_finalization_error?.message,
    },
  });

  // TODO: Send payment failure notification email
}

/**
 * Handle trial ending soon event
 */
async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  const companyId = subscription.metadata.companyId;

  if (!companyId) {
    console.error("[Stripe Webhook] No companyId in subscription metadata");
    return;
  }

  console.log(`[Stripe Webhook] Trial ending soon for company: ${companyId}`);

  // Log trial ending
  await db.collection("auditLog").add({
    companyId,
    action: "trial_ending_soon",
    timestamp: new Date(),
    metadata: {
      subscriptionId: subscription.id,
      trialEnd: subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null,
    },
  });

  // TODO: Send trial ending notification email
}
