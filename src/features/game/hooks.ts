import { useQuery } from "@tanstack/react-query";
import { getEntry } from "./api";

// 남은 횟수 조회 query
export const useEntry = (credentials: { seasonId: number }) => {
    return useQuery({
        queryKey: ["entry"],
        queryFn: async () => await getEntry(credentials),
        retry: false,
    });
};
