/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAds } from "@/features/ads/hooks";
import { createAds, modifyAdsStake, removeAds } from "@/features/ads/api";

const AD_TYPES = [
    { value: "square", label: "사각형 광고" },
    { value: "banner", label: "배너 광고" },
    { value: "front", label: "전면 광고" },
];

export default function AdminAds() {
    const [adTypeFilter, setAdTypeFilter] = useState<string>("all");
    const { data: adsData, isLoading } = useAds({
        adType: adTypeFilter === "all" ? undefined : adTypeFilter,
    });

    const [createAdDialog, setCreateAdDialog] = useState(false);
    const [editStakeDialog, setEditStakeDialog] = useState(false);
    const [deleteAdDialog, setDeleteAdDialog] = useState(false);
    const [selectedAd, setSelectedAd] = useState<any>(null);
    const [errorDialog, setErrorDialog] = useState<{
        open: boolean;
        title: string;
        message: string;
    }>({ open: false, title: "", message: "" });

    const [newAd, setNewAd] = useState({
        adType: "",
        advertiser: "",
        advertiserProfile: "",
        stake: 0,
        adUrl: "",
    });

    const [editStake, setEditStake] = useState(0);

    // Search and pagination states
    const [searchFilters, setSearchFilters] = useState({
        advertiser: "",
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [sortField, setSortField] = useState<string>("");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

    const queryClient = useQueryClient();

    const createAdMutation = useMutation({
        mutationFn: createAds,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin.ads"] });
            setCreateAdDialog(false);
            setNewAd({
                adType: "",
                advertiser: "",
                advertiserProfile: "",
                stake: 0,
                adUrl: "",
            });
        },
        onError: (error: any) => {
            setErrorDialog({
                open: true,
                title: "광고 생성 실패",
                message:
                    error.response?.data?.message ||
                    "광고 생성 중 오류가 발생했습니다.",
            });
        },
    });

    const modifyStakeMutation = useMutation({
        mutationFn: modifyAdsStake,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin.ads"] });
            setEditStakeDialog(false);
            setSelectedAd(null);
        },
        onError: (error: any) => {
            setErrorDialog({
                open: true,
                title: "지분 수정 실패",
                message:
                    error.response?.data?.message ||
                    "지분 수정 중 오류가 발생했습니다.",
            });
        },
    });

    const deleteAdMutation = useMutation({
        mutationFn: removeAds,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin.ads"] });
            setDeleteAdDialog(false);
            setSelectedAd(null);
        },
        onError: (error: any) => {
            setErrorDialog({
                open: true,
                title: "광고 삭제 실패",
                message:
                    error.response?.data?.message ||
                    "광고 삭제 중 오류가 발생했습니다.",
            });
        },
    });

    const handleCreateAd = () => {
        if (
            !newAd.adType ||
            !newAd.advertiser ||
            !newAd.advertiserProfile ||
            !newAd.adUrl ||
            newAd.stake <= 0
        ) {
            setErrorDialog({
                open: true,
                title: "입력 오류",
                message: "모든 필드를 올바르게 입력해주세요.",
            });
            return;
        }
        createAdMutation.mutate(newAd);
    };

    const handleEditStake = () => {
        if (!selectedAd || editStake <= 0) {
            setErrorDialog({
                open: true,
                title: "입력 오류",
                message: "지분을 올바르게 입력해주세요.",
            });
            return;
        }
        modifyStakeMutation.mutate({
            id: selectedAd.id.toString(),
            stake: editStake,
        });
    };

    const handleDeleteAd = () => {
        if (!selectedAd) return;
        deleteAdMutation.mutate({
            id: selectedAd.id.toString(),
        });
    };

    const openEditStakeDialog = (ad: any) => {
        setSelectedAd(ad);
        setEditStake(ad.stake);
        setEditStakeDialog(true);
    };

    const openDeleteDialog = (ad: any) => {
        setSelectedAd(ad);
        setDeleteAdDialog(true);
    };

    const ads = useMemo(() => adsData?.data || [], [adsData?.data]);

    // Filter and sort ads
    const filteredAndSortedAds = useMemo(() => {
        let filtered = ads;

        // Apply search filters
        filtered = ads.filter((ad) => {
            const advertiserMatch = searchFilters.advertiser
                ? ad.advertiser
                      ?.toLowerCase()
                      .includes(searchFilters.advertiser.toLowerCase())
                : true;
            return advertiserMatch;
        });

        // Apply sorting
        if (sortField) {
            filtered.sort((a, b) => {
                const aValue = a[sortField as keyof typeof a];
                const bValue = b[sortField as keyof typeof b];

                // Convert to string for comparison
                const aStr = String(aValue || "").toLowerCase();
                const bStr = String(bValue || "").toLowerCase();

                if (sortDirection === "asc") {
                    return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
                } else {
                    return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
                }
            });
        }

        return filtered;
    }, [ads, searchFilters, sortField, sortDirection]);

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedAds.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentAds = filteredAndSortedAds.slice(startIndex, endIndex);

    // Reset to first page when search changes
    const handleFilterChange = (
        field: keyof typeof searchFilters,
        value: string
    ) => {
        setSearchFilters((prev) => ({ ...prev, [field]: value }));
        setCurrentPage(1);
    };

    // Check if any filter is active
    const hasActiveFilters =
        Object.values(searchFilters).some((value) => value !== "") ||
        adTypeFilter !== "all";

    // Handle sorting
    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    // Pagination handlers
    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    const getSortIcon = (field: string) => {
        if (sortField !== field) return "";
        return sortDirection === "asc" ? "↑" : "↓";
    };

    const getAdTypeLabel = (adType: string) => {
        return AD_TYPES.find((type) => type.value === adType)?.label || adType;
    };

    if (isLoading) {
        return (
            <div className="flex-1 p-[50px]">
                <div>로딩 중...</div>
            </div>
        );
    }

    return (
        <div
            className="flex-1"
            style={{
                width: "calc(100dvw - 16rem)",
            }}
        >
            <div className="w-full p-[50px]">
                {/* Search and Info Section */}
                <div className="mb-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold">광고 관리</h1>
                        <div className="text-sm text-gray-600">
                            총 {filteredAndSortedAds.length}개
                            {hasActiveFilters &&
                                ` (전체 ${ads.length}개 중 검색됨)`}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div>
                            <Label className="text-sm font-medium text-gray-700 mb-1 block">
                                광고 타입
                            </Label>
                            <Select
                                value={adTypeFilter}
                                onValueChange={setAdTypeFilter}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="모든 타입" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        모든 타입
                                    </SelectItem>
                                    {AD_TYPES.map((type) => (
                                        <SelectItem
                                            key={type.value}
                                            value={type.value}
                                        >
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="text-sm font-medium text-gray-700 mb-1 block">
                                광고주
                            </Label>
                            <Input
                                placeholder="광고주 검색"
                                value={searchFilters.advertiser}
                                onChange={(e) =>
                                    handleFilterChange(
                                        "advertiser",
                                        e.target.value
                                    )
                                }
                            />
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setSearchFilters({ advertiser: "" });
                                setAdTypeFilter("all");
                                setSortField("");
                                setCurrentPage(1);
                            }}
                            className="w-full"
                        >
                            초기화
                        </Button>
                    </div>
                </div>

                <div className="flex justify-end items-center mb-6">
                    <Dialog
                        open={createAdDialog}
                        onOpenChange={setCreateAdDialog}
                    >
                        <DialogTrigger asChild>
                            <Button variant="default">광고 추가</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>새 광고 추가</DialogTitle>
                                <DialogDescription>
                                    새로운 광고를 추가합니다.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-sm font-medium">
                                        광고 타입
                                    </Label>
                                    <Select
                                        value={newAd.adType}
                                        onValueChange={(value) =>
                                            setNewAd((prev) => ({
                                                ...prev,
                                                adType: value,
                                            }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="광고 타입 선택" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {AD_TYPES.map((type) => (
                                                <SelectItem
                                                    key={type.value}
                                                    value={type.value}
                                                >
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">
                                        광고주
                                    </Label>
                                    <Input
                                        value={newAd.advertiser}
                                        onChange={(e) =>
                                            setNewAd((prev) => ({
                                                ...prev,
                                                advertiser: e.target.value,
                                            }))
                                        }
                                        placeholder="광고주명을 입력하세요"
                                    />
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">
                                        광고주 프로필
                                    </Label>
                                    <Input
                                        value={newAd.advertiserProfile}
                                        onChange={(e) =>
                                            setNewAd((prev) => ({
                                                ...prev,
                                                advertiserProfile:
                                                    e.target.value,
                                            }))
                                        }
                                        placeholder="광고주 프로필을 입력하세요"
                                    />
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">
                                        지분
                                    </Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={newAd.stake}
                                        onChange={(e) =>
                                            setNewAd((prev) => ({
                                                ...prev,
                                                stake:
                                                    parseInt(e.target.value) ||
                                                    0,
                                            }))
                                        }
                                        placeholder="지분을 입력하세요"
                                    />
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">
                                        광고 URL
                                    </Label>
                                    <Input
                                        value={newAd.adUrl}
                                        onChange={(e) =>
                                            setNewAd((prev) => ({
                                                ...prev,
                                                adUrl: e.target.value,
                                            }))
                                        }
                                        placeholder="광고 URL을 입력하세요"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setCreateAdDialog(false)}
                                >
                                    취소
                                </Button>
                                <Button
                                    onClick={handleCreateAd}
                                    disabled={createAdMutation.isPending}
                                >
                                    추가
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="w-full overflow-x-auto">
                    <Table className="min-w-full">
                        <TableHeader>
                            <TableRow>
                                <TableHead
                                    className="cursor-pointer hover:bg-gray-50 select-none"
                                    onClick={() => handleSort("active")}
                                >
                                    상태 {getSortIcon("active")}
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer hover:bg-gray-50 select-none"
                                    onClick={() => handleSort("adType")}
                                >
                                    타입 {getSortIcon("adType")}
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer hover:bg-gray-50 select-none"
                                    onClick={() => handleSort("advertiser")}
                                >
                                    광고주 {getSortIcon("advertiser")}
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer hover:bg-gray-50 select-none"
                                    onClick={() =>
                                        handleSort("advertiserProfile")
                                    }
                                >
                                    프로필 {getSortIcon("advertiserProfile")}
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer hover:bg-gray-50 select-none"
                                    onClick={() => handleSort("stake")}
                                >
                                    지분 {getSortIcon("stake")}
                                </TableHead>
                                <TableHead>광고 URL</TableHead>
                                <TableHead>관리</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAndSortedAds.length === 0 && !isLoading ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="text-center py-8 text-gray-500"
                                    >
                                        {hasActiveFilters
                                            ? "검색 결과가 없습니다."
                                            : "광고가 없습니다."}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                currentAds.map((ad) => (
                                    <TableRow key={ad.id}>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    ad.active
                                                        ? "default"
                                                        : "destructive"
                                                }
                                            >
                                                {ad.active ? "활성" : "비활성"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {getAdTypeLabel(ad.adType)}
                                        </TableCell>
                                        <TableCell>{ad.advertiser}</TableCell>
                                        <TableCell>
                                            {ad.advertiserProfile}
                                        </TableCell>
                                        <TableCell>{ad.stake}</TableCell>
                                        <TableCell>
                                            <a
                                                href={ad.adUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline max-w-xs truncate block"
                                            >
                                                {ad.adUrl}
                                            </a>
                                        </TableCell>
                                        <TableCell className="flex gap-[8px]">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    openEditStakeDialog(ad)
                                                }
                                            >
                                                지분 수정
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() =>
                                                    openDeleteDialog(ad)
                                                }
                                            >
                                                삭제
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6">
                        <div className="text-sm text-gray-600">
                            {startIndex + 1}-
                            {Math.min(endIndex, filteredAndSortedAds.length)}
                            페이지 (총 {filteredAndSortedAds.length}개 중)
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => goToPage(1)}
                                disabled={currentPage === 1}
                            >
                                처음
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                이전
                            </Button>

                            <div className="flex items-center space-x-1">
                                {Array.from(
                                    { length: Math.min(5, totalPages) },
                                    (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (
                                            currentPage >=
                                            totalPages - 2
                                        ) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }

                                        return (
                                            <Button
                                                key={pageNum}
                                                variant={
                                                    currentPage === pageNum
                                                        ? "default"
                                                        : "outline"
                                                }
                                                size="sm"
                                                onClick={() =>
                                                    goToPage(pageNum)
                                                }
                                                className="w-8"
                                            >
                                                {pageNum}
                                            </Button>
                                        );
                                    }
                                )}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                다음
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => goToPage(totalPages)}
                                disabled={currentPage === totalPages}
                            >
                                마지막
                            </Button>
                        </div>
                    </div>
                )}

                {/* Edit Stake Dialog */}
                <Dialog
                    open={editStakeDialog}
                    onOpenChange={setEditStakeDialog}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>지분 수정</DialogTitle>
                            <DialogDescription>
                                {selectedAd?.advertiser}의 지분을 수정합니다.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label className="text-sm font-medium">
                                    지분
                                </Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={editStake}
                                    onChange={(e) =>
                                        setEditStake(
                                            parseInt(e.target.value) || 0
                                        )
                                    }
                                    placeholder="새로운 지분을 입력하세요"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setEditStakeDialog(false)}
                            >
                                취소
                            </Button>
                            <Button
                                onClick={handleEditStake}
                                disabled={modifyStakeMutation.isPending}
                            >
                                수정
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Ad Dialog */}
                <Dialog open={deleteAdDialog} onOpenChange={setDeleteAdDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>광고 삭제</DialogTitle>
                            <DialogDescription>
                                {selectedAd?.advertiser}의 광고를
                                삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setDeleteAdDialog(false)}
                            >
                                취소
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteAd}
                                disabled={deleteAdMutation.isPending}
                            >
                                삭제
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Error Dialog */}
                <Dialog
                    open={errorDialog.open}
                    onOpenChange={(open) =>
                        setErrorDialog((prev) => ({ ...prev, open }))
                    }
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{errorDialog.title}</DialogTitle>
                            <DialogDescription>
                                {errorDialog.message}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                onClick={() =>
                                    setErrorDialog((prev) => ({
                                        ...prev,
                                        open: false,
                                    }))
                                }
                            >
                                확인
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
