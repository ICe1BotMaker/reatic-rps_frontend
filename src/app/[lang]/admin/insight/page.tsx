"use client";

import {
    ActivityIcon,
    Gamepad2Icon,
    Loader2Icon,
    SmileIcon,
    TrendingUpIcon,
    UsersRoundIcon,
    VenusAndMarsIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { PieChart } from "@/components/pie-chart";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import {
    useInsight,
    useInsightWithSeason,
} from "@/features/admin/insight/hooks";
import { useActiveSeason } from "@/features/season/hooks";

type InsightDistribution = {
    label: string;
    value: number;
    percentage: number;
};

interface SummaryMetric {
    key: string;
    label: string;
    primary: number | string;
    icon: LucideIcon;
    unit?: string;
    description?: string;
    format?: (value: number | string) => string;
}

export default function Insight() {
    const [selectedSeasonId, setSelectedSeasonId] = useState<number | null>(
        null
    );

    const seasonsQuery = useActiveSeason();
    const insightQuery = useInsight();
    const seasonInsightQuery = useInsightWithSeason({
        seasonId: selectedSeasonId ?? 0,
    });

    const isSeasonMode = Boolean(selectedSeasonId);

    const activeInsightQuery = isSeasonMode ? seasonInsightQuery : insightQuery;
    const isInsightLoading = isSeasonMode
        ? seasonInsightQuery.isLoading || seasonInsightQuery.isFetching
        : insightQuery.isLoading || insightQuery.isFetching;
    const isInsightError = isSeasonMode
        ? seasonInsightQuery.isError
        : insightQuery.isError;

    const insightData = activeInsightQuery.data?.data;
    const genderData = insightData?.genderDistribution ?? {
        MALE: 0,
        FEMALE: 0,
    };

    const isFilterFetching = isSeasonMode
        ? seasonInsightQuery.isFetching
        : insightQuery.isFetching;

    const totalMembers = useMemo(() => {
        if (!insightData) {
            return 0;
        }

        if (isSeasonMode) {
            return (
                insightData.totalMembersAtSeason ??
                insightData.totalMembers ??
                0
            );
        }

        return (
            insightData.totalMembers ?? insightData.totalMembersAtSeason ?? 0
        );
    }, [insightData, isSeasonMode]);

    const totalParticipations = insightData?.totalParticipations ?? 0;

    const averageParticipation = useMemo(() => {
        if (totalMembers === 0) {
            return 0;
        }

        return totalParticipations / totalMembers;
    }, [totalMembers, totalParticipations]);

    const seasons = seasonsQuery.data?.data ?? [];
    const selectedSeason = seasons.find(
        (season) => season.id === selectedSeasonId
    );

    const ageDistribution = useMemo<InsightDistribution[]>(() => {
        if (!insightData?.ageGroupDistribution) {
            return [];
        }

        const entries = Object.entries(insightData.ageGroupDistribution)
            .filter(([, value]) => typeof value === "number" && value >= 0)
            .map(([label, value]) => ({ label, value }))
            .sort((a, b) => b.value - a.value);

        const total = entries.reduce((sum, item) => sum + item.value, 0);

        if (total === 0) {
            return entries.map((item) => ({
                ...item,
                percentage: 0,
            }));
        }

        return entries.map((item) => ({
            ...item,
            percentage: Number(((item.value / total) * 100).toFixed(1)),
        }));
    }, [insightData]);

    const topAgeGroup = ageDistribution[0];

    const totalGenderParticipants =
        (genderData?.MALE ?? 0) + (genderData?.FEMALE ?? 0);

    const malePercentage = totalGenderParticipants
        ? Number(
              (
                  ((genderData?.MALE ?? 0) / totalGenderParticipants) *
                  100
              ).toFixed(1)
          )
        : 0;
    const femalePercentage = totalGenderParticipants
        ? Number(
              (
                  ((genderData?.FEMALE ?? 0) / totalGenderParticipants) *
                  100
              ).toFixed(1)
          )
        : 0;

    const summaryMetrics = useMemo<SummaryMetric[]>(() => {
        const metrics: SummaryMetric[] = [
            {
                key: "total-members",
                label: isSeasonMode ? "시즌 방문자 수" : "총 방문자 수",
                primary: totalMembers,
                unit: "명",
                icon: UsersRoundIcon,
                description: isSeasonMode
                    ? "선택한 시즌 동안 서비스에 방문한 이용자 수"
                    : "전체 기간 동안 누적 방문한 이용자 수",
            },
            {
                key: "total-participations",
                label: "총 참가 횟수",
                primary: totalParticipations,
                unit: "회",
                icon: Gamepad2Icon,
                description: "게임에 참여한 총 횟수입니다",
            },
            {
                key: "avg-participation",
                label: "평균 참가 횟수",
                primary: averageParticipation,
                unit: "회 / 인",
                icon: TrendingUpIcon,
                format: (value) =>
                    typeof value === "number"
                        ? value.toFixed(1)
                        : String(value),
                description: "방문자 1인당 평균 참여 횟수",
            },
        ];

        metrics.push({
            key: "top-age-group",
            label: "핵심 연령대",
            primary: topAgeGroup ? topAgeGroup.label : "데이터 없음",
            icon: SmileIcon,
            description: topAgeGroup
                ? `${topAgeGroup.value}명 · ${topAgeGroup.percentage}% 참여`
                : "연령대 데이터가 아직 없어요",
        });

        if (isSeasonMode) {
            metrics.push({
                key: "season-ratio",
                label: "성별 비율",
                primary: `${malePercentage}% · ${femalePercentage}%`,
                icon: VenusAndMarsIcon,
                description: "남성 · 여성 참여 비율",
            });
        }

        return metrics;
    }, [
        isSeasonMode,
        totalMembers,
        totalParticipations,
        averageParticipation,
        topAgeGroup,
        malePercentage,
        femalePercentage,
    ]);

    const headerDescription = isSeasonMode
        ? `${
              selectedSeason?.seasonName ?? "선택한 시즌"
          }의 주요 지표를 확인하세요.`
        : "전체 기간 운영 지표입니다.";

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
            <section className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        <ActivityIcon className="h-4 w-4" />
                        <span>운영 인사이트</span>
                    </div>
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <div className="space-y-1">
                            <h1 className="text-2xl font-semibold text-c_black">
                                인사이트 대시보드
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {headerDescription}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground">
                                시즌 선택
                            </span>
                            <Select
                                value={
                                    selectedSeasonId
                                        ? String(selectedSeasonId)
                                        : "all"
                                }
                                onValueChange={(value) => {
                                    setSelectedSeasonId(
                                        value === "all" ? null : Number(value)
                                    );
                                }}
                                disabled={seasonsQuery.isLoading}
                            >
                                <SelectTrigger className="w-[220px] border-slate-200">
                                    <SelectValue placeholder="전체 시즌" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        전체 시즌
                                    </SelectItem>
                                    {seasons.map((season) => (
                                        <SelectItem
                                            key={season.id}
                                            value={String(season.id)}
                                        >
                                            {season.seasonName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {isFilterFetching && (
                                <Loader2Icon className="h-4 w-4 animate-spin text-muted-foreground" />
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {isInsightLoading ? (
                    Array.from({ length: summaryMetrics.length }).map(
                        (_, index) => (
                            <Card
                                key={`summary-skeleton-${index}`}
                                className="border border-slate-200/70 bg-white/60 shadow-sm"
                            >
                                <CardHeader className="flex flex-col gap-4 pb-0">
                                    <Skeleton className="h-4 w-24" />
                                </CardHeader>
                                <CardContent className="flex flex-col gap-4">
                                    <Skeleton className="h-8 w-32" />
                                    <Skeleton className="h-3 w-full" />
                                </CardContent>
                            </Card>
                        )
                    )
                ) : isInsightError ? (
                    <Card className="md:col-span-2 lg:col-span-3 xl:col-span-4 border border-red-200 bg-red-50">
                        <CardHeader>
                            <CardTitle className="text-red-700">
                                데이터를 불러오는 중 오류가 발생했어요
                            </CardTitle>
                            <CardDescription className="text-red-600">
                                잠시 후 다시 시도하거나, 새로고침해 주세요.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                ) : (
                    summaryMetrics.map((metric) => {
                        const Icon = metric.icon;
                        const rawValue = metric.primary;
                        const displayValue = metric.format
                            ? metric.format(rawValue)
                            : typeof rawValue === "number"
                            ? rawValue
                            : rawValue;

                        return (
                            <Card
                                key={metric.key}
                                className="relative overflow-hidden border border-slate-200 bg-white shadow-sm"
                            >
                                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                    <div className="space-y-1">
                                        <CardDescription>
                                            {metric.label}
                                        </CardDescription>
                                        <CardTitle className="text-3xl font-semibold text-c_black">
                                            {displayValue}
                                            {metric.unit ? (
                                                <span className="ml-2 text-base font-medium text-muted-foreground">
                                                    {metric.unit}
                                                </span>
                                            ) : null}
                                        </CardTitle>
                                    </div>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                </CardHeader>
                                {metric.description ? (
                                    <CardContent className="pt-0 text-sm text-muted-foreground">
                                        {metric.description}
                                    </CardContent>
                                ) : null}
                            </Card>
                        );
                    })
                )}
            </section>

            <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)]">
                <Card className="border border-slate-200 bg-white shadow-sm">
                    <CardHeader className="pb-4">
                        <CardTitle>연령대 분포</CardTitle>
                        <CardDescription>
                            주 이용자 연령대를 확인하고 타겟 전략에 활용해
                            보세요.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isInsightLoading ? (
                            <div className="space-y-4">
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <div
                                        key={`age-skeleton-${index}`}
                                        className="space-y-2"
                                    >
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-full" />
                                    </div>
                                ))}
                            </div>
                        ) : ageDistribution.length === 0 ? (
                            <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 bg-slate-50 text-center text-sm text-muted-foreground">
                                <SmileIcon className="h-5 w-5" />
                                <p>아직 연령대 데이터가 충분하지 않아요.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {ageDistribution.map((item) => (
                                    <div key={item.label} className="space-y-2">
                                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                                            <span className="font-medium text-c_black">
                                                {item.label}
                                            </span>
                                            <span>
                                                {item.value}명 ·{" "}
                                                {item.percentage}%
                                            </span>
                                        </div>
                                        <div className="h-2 rounded-full bg-slate-100">
                                            <div
                                                className="h-2 rounded-full bg-gradient-to-r from-c_primary to-c_primary_softlight"
                                                style={{
                                                    width: `${Math.min(
                                                        100,
                                                        Math.max(
                                                            item.percentage,
                                                            item.percentage > 0
                                                                ? 6
                                                                : 0
                                                        )
                                                    )}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border border-slate-200 bg-white shadow-sm">
                    <CardHeader className="pb-4">
                        <CardTitle>성별 분포</CardTitle>
                        <CardDescription>
                            성별별 참여 비율을 비교해 보세요.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-6 lg:flex-row lg:items-stretch">
                        {isInsightLoading ? (
                            <div className="flex w-full flex-col items-center gap-4">
                                <Skeleton className="h-48 w-48 rounded-full" />
                                <Skeleton className="h-4 w-36" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        ) : totalGenderParticipants === 0 ? (
                            <div className="flex h-48 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 bg-slate-50 text-center text-sm text-muted-foreground">
                                <VenusAndMarsIcon className="h-5 w-5" />
                                <p>성별 데이터가 아직 없어요.</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-center lg:w-1/2">
                                    <PieChart
                                        data={[
                                            {
                                                label: "남성",
                                                value: genderData.MALE ?? 0,
                                                color: "#3b82f6",
                                            },
                                            {
                                                label: "여성",
                                                value: genderData.FEMALE ?? 0,
                                                color: "#ec4899",
                                            },
                                        ]}
                                        width={220}
                                        height={220}
                                        innerRadius={60}
                                    />
                                </div>
                                <div className="grid flex-1 gap-4 self-center">
                                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                                            <span className="font-medium text-c_black">
                                                남성
                                            </span>
                                            <span>
                                                {genderData.MALE}명 ·{" "}
                                                {malePercentage}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                                            <span className="font-medium text-c_black">
                                                여성
                                            </span>
                                            <span>
                                                {genderData.FEMALE}명 ·{" "}
                                                {femalePercentage}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}
