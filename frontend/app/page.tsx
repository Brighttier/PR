import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Home() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Coss UI Demo</h1>
          <p className="text-muted-foreground">A showcase of Coss UI components</p>
        </div>

        <Alert>
          <p className="font-semibold">Welcome!</p>
          <p className="text-sm">Coss UI has been successfully installed and configured.</p>
          <div className="mt-3">
            <Link href="/dashboard">
              <Button size="sm">View ATS Dashboard Demo</Button>
            </Link>
          </div>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Button Components</CardTitle>
              <CardDescription>Various button styles and variants</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Badges</CardTitle>
              <CardDescription>Status indicators and labels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="info">Info</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Form Example</CardTitle>
              <CardDescription>Input fields with labels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Enter your name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Enter your email" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Submit</Button>
            </CardFooter>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Available Components</CardTitle>
            <CardDescription>All 48 Coss UI components are now installed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[
                'Accordion', 'Alert', 'Alert Dialog', 'Avatar', 'Badge', 'Breadcrumb',
                'Button', 'Card', 'Checkbox', 'Combobox', 'Dialog', 'Form', 'Input',
                'Label', 'Menu', 'Popover', 'Select', 'Sheet', 'Slider', 'Switch',
                'Table', 'Tabs', 'Textarea', 'Toast', 'Tooltip', 'and more...'
              ].map((name) => (
                <Badge key={name} variant="outline">{name}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
