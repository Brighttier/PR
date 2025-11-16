"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Briefcase,
  GraduationCap,
  Award,
  Code,
  TrendingUp,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Plus,
  Lightbulb,
  Loader2,
  MapPin,
  ExternalLink
} from "lucide-react";

interface ResumePreviewProps {
  parsedData: any;
  skillSuggestions?: string[];
  userId?: string;
  onContinue: () => void;
}

export default function ResumePreviewCard({ parsedData, skillSuggestions = [], userId, onContinue }: ResumePreviewProps) {
  if (!parsedData) return null;

  const { personalInfo, summary, experience, education, skills, totalExperienceYears, careerLevel, certifications } = parsedData;

  const [selectedSuggestions, setSelectedSuggestions] = React.useState<string[]>([]);
  const [showJobRecommendations, setShowJobRecommendations] = React.useState(false);
  const [jobRecommendations, setJobRecommendations] = React.useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = React.useState(false);

  const handleContinueClick = async () => {
    if (!userId) {
      onContinue();
      return;
    }

    // Load job recommendations before continuing
    setLoadingJobs(true);
    setShowJobRecommendations(true);

    try {
      const response = await fetch('/api/ai/match-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        const result = await response.json();
        setJobRecommendations(result.recommendations || []);
      }
    } catch (error) {
      console.error('Failed to load job recommendations:', error);
    } finally {
      setLoadingJobs(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-2">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold">Resume Analyzed Successfully!</h2>
        <p className="text-muted-foreground">
          We've extracted key information from your resume using AI
        </p>
      </div>

      {/* Preview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>AI-Extracted Profile</CardTitle>
          </div>
          <CardDescription>
            Review the information we found in your resume
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-6">
              {/* Career Level & Experience */}
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <TrendingUp className="h-8 w-8 text-primary" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Career Level</p>
                  <p className="font-semibold capitalize">{careerLevel || "Entry"}</p>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Total Experience</p>
                  <p className="font-semibold">{totalExperienceYears || 0} years</p>
                </div>
              </div>

              {/* Summary */}
              {summary && (
                <div>
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Professional Summary
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {summary}
                  </p>
                </div>
              )}

              {/* Skills */}
              {skills && (skills.technical?.length > 0 || skills.tools?.length > 0) && (
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    Skills Detected
                  </h3>
                  <div className="space-y-3">
                    {skills.technical?.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Technical Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {skills.technical.slice(0, 10).map((skill: string, idx: number) => (
                            <Badge key={idx} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                          {skills.technical.length > 10 && (
                            <Badge variant="outline">+{skills.technical.length - 10} more</Badge>
                          )}
                        </div>
                      </div>
                    )}
                    {skills.tools?.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Tools & Frameworks</p>
                        <div className="flex flex-wrap gap-2">
                          {skills.tools.slice(0, 8).map((tool: string, idx: number) => (
                            <Badge key={idx} variant="outline">
                              {tool}
                            </Badge>
                          ))}
                          {skills.tools.length > 8 && (
                            <Badge variant="outline">+{skills.tools.length - 8} more</Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Experience */}
              {experience && experience.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Work Experience ({experience.length})
                  </h3>
                  <div className="space-y-3">
                    {experience.slice(0, 3).map((job: any, idx: number) => (
                      <div key={idx} className="border-l-2 border-primary/20 pl-3">
                        <p className="font-medium text-sm">{job.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {job.company} • {job.current ? "Present" : job.endDate || "N/A"}
                        </p>
                      </div>
                    ))}
                    {experience.length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        +{experience.length - 3} more positions
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Education */}
              {education && education.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Education ({education.length})
                  </h3>
                  <div className="space-y-2">
                    {education.map((edu: any, idx: number) => (
                      <div key={idx} className="border-l-2 border-primary/20 pl-3">
                        <p className="font-medium text-sm">{edu.degree} in {edu.field}</p>
                        <p className="text-xs text-muted-foreground">{edu.institution}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {certifications && certifications.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Certifications ({certifications.length})
                  </h3>
                  <div className="space-y-2">
                    {certifications.map((cert: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Award className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">{cert.name}</p>
                          <p className="text-xs text-muted-foreground">{cert.issuer}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Skill Suggestions */}
              {skillSuggestions && skillSuggestions.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                    AI Skill Suggestions
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Based on your experience, you might also have these skills. Click to add them to your profile:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {skillSuggestions.map((skill: string, idx: number) => {
                      const isSelected = selectedSuggestions.includes(skill);
                      return (
                        <Badge
                          key={idx}
                          variant={isSelected ? "default" : "outline"}
                          className="cursor-pointer hover:bg-primary/10 transition-colors"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedSuggestions(selectedSuggestions.filter(s => s !== skill));
                            } else {
                              setSelectedSuggestions([...selectedSuggestions, skill]);
                            }
                          }}
                        >
                          {isSelected && <CheckCircle2 className="h-3 w-3 mr-1" />}
                          {!isSelected && <Plus className="h-3 w-3 mr-1" />}
                          {skill}
                        </Badge>
                      );
                    })}
                  </div>
                  {selectedSuggestions.length > 0 && (
                    <p className="text-xs text-green-600 mt-2">
                      ✓ {selectedSuggestions.length} skill{selectedSuggestions.length > 1 ? 's' : ''} selected and will be added to your profile
                    </p>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Job Recommendations Section */}
          {showJobRecommendations && (
            <div className="mt-6 border-t pt-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Recommended Jobs For You
              </h3>

              {loadingJobs ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Finding matching jobs...</span>
                </div>
              ) : jobRecommendations.length > 0 ? (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {jobRecommendations.map((job, idx) => (
                    <div key={idx} className="border rounded-lg p-4 hover:border-primary/50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">{job.jobTitle}</h4>
                          <p className="text-sm text-muted-foreground">{job.company}</p>
                        </div>
                        <Badge variant={
                          job.matchScore >= 80 ? "default" :
                          job.matchScore >= 70 ? "secondary" : "outline"
                        }>
                          {job.matchScore}% Match
                        </Badge>
                      </div>
                      <div className="flex gap-2 mb-2">
                        {job.location && (
                          <Badge variant="outline" className="text-xs">
                            <MapPin className="h-3 w-3 mr-1" />
                            {job.location}
                          </Badge>
                        )}
                        {job.type && (
                          <Badge variant="outline" className="text-xs">
                            {job.type}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{job.reason}</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-xs">
                          View Job
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-4">
                  No job recommendations available at this time. Check back later!
                </p>
              )}
            </div>
          )}

          {/* Continue Button */}
          <div className="mt-6 space-y-3">
            {!showJobRecommendations ? (
              <Button onClick={handleContinueClick} className="w-full" size="lg" disabled={loadingJobs}>
                {loadingJobs ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Finding Jobs...
                  </>
                ) : (
                  <>
                    Continue to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={onContinue} className="w-full" size="lg">
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
            <p className="text-xs text-center text-muted-foreground">
              You can edit all this information later in your profile
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
