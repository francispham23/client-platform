import { useCallback, useState } from "react";

export const useForceRefresh = (refetch: Function) => {
  const [forceRefreshing, setForceRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setForceRefreshing(true);
    console.log("Refreshing...");
    return refetch().then(() => {
      setForceRefreshing(false);
    });
  }, [refetch]);

  return { forceRefreshing, onRefresh };
};
