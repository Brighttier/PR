"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Award, TrendingUp } from "lucide-react";

interface SkillScore {
  skill: string;
  score: number; // 0-10
  evidence?: string[];
  assessment?: string;
}

interface SkillsRadarProps {
  skills: SkillScore[];
  className?: string;
  showLegend?: boolean;
}

/**
 * Skills Radar Chart Component
 *
 * Displays skill scores as a radar/spider chart
 */
export function SkillsRadar({ skills, className = "", showLegend = true }: SkillsRadarProps) {
  // Prepare data for radar chart
  const chartData = skills.map((skill) => ({
    skill: skill.skill,
    score: skill.score,
    fullMark: 10,
  }));

  // Calculate overall score
  const avgScore = skills.length > 0
    ? skills.reduce((sum, skill) => sum + skill.score, 0) / skills.length
    : 0;

  // Get score level
  const getScoreLevel = (score: number) => {
    if (score >= 8) return { label: "Expert", color: "text-green-600" };
    if (score >= 6) return { label: "Proficient", color: "text-green-500" };
    if (score >= 4) return { label: "Intermediate", color: "text-yellow-600" };
    if (score >= 2) return { label: "Beginner", color: "text-orange-600" };
    return { label: "Novice", color: "text-red-600" };
  };

  const overallLevel = getScoreLevel(avgScore);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const skillData = skills.find((s) => s.skill === data.payload.skill);
      const level = getScoreLevel(data.value);

      return (
        <div className="bg-card border rounded-lg p-3 shadow-lg max-w-xs">
          <p className="text-sm font-medium mb-1">{data.payload.skill}</p>
          <div className="flex items-center gap-2 mb-2">
            <p className={`text-lg font-bold ${level.color}`}>
              {data.value}/10
            </p>
            <p className={`text-xs ${level.color}`}>{level.label}</p>
          </div>
          {skillData?.assessment && (
            <p className="text-xs text-muted-foreground">
              {skillData.assessment}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Technical Skills Assessment</CardTitle>
            <CardDescription>
              Proficiency levels across key technical skills
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <Award className={`w-5 h-5 ${overallLevel.color}`} />
              <p className={`text-lg font-bold ${overallLevel.color}`}>
                {avgScore.toFixed(1)}/10
              </p>
            </div>
            <p className="text-xs text-muted-foreground">{overallLevel.label}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {skills.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            <p className="text-sm">No skills data available</p>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={chartData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis
                  dataKey="skill"
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 10]}
                  tick={{ fontSize: 10, fill: "#6b7280" }}
                />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#16a34a"
                  fill="#16a34a"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>

            {/* Skills List */}
            <div className="mt-6 space-y-3">
              <p className="text-sm font-medium">Detailed Breakdown</p>
              <div className="space-y-2">
                {skills
                  .sort((a, b) => b.score - a.score)
                  .map((skill, index) => {
                    const level = getScoreLevel(skill.score);
                    return (
                      <div
                        key={index}
                        className="p-3 rounded-lg border hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium">{skill.skill}</p>
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-bold ${level.color}`}>
                              {skill.score}/10
                            </p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${level.color} bg-opacity-10`}>
                              {level.label}
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
                          <div
                            className="h-full bg-green-500 transition-all"
                            style={{ width: `${skill.score * 10}%` }}
                          />
                        </div>

                        {skill.assessment && (
                          <p className="text-xs text-muted-foreground">
                            {skill.assessment}
                          </p>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          </>
        )}

        {/* Legend */}
        <div className="mt-6 pt-4 border-t grid grid-cols-5 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-600" />
            <span>Expert (8-10)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Proficient (6-8)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span>Intermediate (4-6)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span>Beginner (2-4)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Novice (0-2)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Compact Skills Display (for smaller spaces)
 */
export function CompactSkillsList({ skills, className = "" }: SkillsRadarProps) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600 bg-green-100";
    if (score >= 6) return "text-green-500 bg-green-50";
    if (score >= 4) return "text-yellow-600 bg-yellow-100";
    if (score >= 2) return "text-orange-600 bg-orange-100";
    return "text-red-600 bg-red-100";
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {skills.map((skill, index) => (
        <div key={index} className="flex items-center justify-between">
          <span className="text-sm">{skill.skill}</span>
          <div className="flex items-center gap-2">
            <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500"
                style={{ width: `${skill.score * 10}%` }}
              />
            </div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${getScoreColor(skill.score)}`}>
              {skill.score}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skills Comparison (compare candidate to requirements)
 */
export function SkillsComparison({
  candidateSkills,
  requiredSkills,
  className = "",
}: {
  candidateSkills: SkillScore[];
  requiredSkills: string[];
  className?: string;
}) {
  // Match candidate skills to requirements
  const comparison = requiredSkills.map((reqSkill) => {
    const candidateSkill = candidateSkills.find(
      (cs) => cs.skill.toLowerCase() === reqSkill.toLowerCase()
    );
    return {
      skill: reqSkill,
      candidateScore: candidateSkill?.score || 0,
      requiredScore: 7, // Assume 7/10 is required
      hasSkill: !!candidateSkill,
    };
  });

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Skills Match Analysis</CardTitle>
        <CardDescription>
          Candidate skills vs job requirements
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {comparison.map((item, index) => {
            const isMet = item.candidateScore >= item.requiredScore;
            return (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  isMet
                    ? "border-green-200 bg-green-50/50"
                    : "border-orange-200 bg-orange-50/50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">{item.skill}</p>
                  <div className="flex items-center gap-2">
                    {isMet ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <Award className="w-4 h-4 text-orange-600" />
                    )}
                    <span
                      className={`text-sm font-semibold ${
                        isMet ? "text-green-600" : "text-orange-600"
                      }`}
                    >
                      {item.candidateScore}/10
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        isMet ? "bg-green-500" : "bg-orange-500"
                      } transition-all`}
                      style={{ width: `${item.candidateScore * 10}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Required: {item.requiredScore}/10
                  </span>
                </div>

                {!item.hasSkill && (
                  <p className="text-xs text-orange-600 mt-1">
                    ⚠️ Not demonstrated in interview
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
