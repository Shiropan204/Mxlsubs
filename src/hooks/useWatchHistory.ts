import useSWR from "swr";

export function useWatchHistory() {
  const { data, mutate } = useSWR(`watchHistory`, () => {
    const raw = localStorage.getItem(`watchHistory`);
    return raw ? JSON.parse(raw) : {};
  });

  const updateHistory = (newHistory: any) => {
    localStorage.setItem(`watchHistory`, JSON.stringify(newHistory));
    mutate(newHistory, false); // mutate without revalidation
  };

  return [data || {}, updateHistory] as const;
}
