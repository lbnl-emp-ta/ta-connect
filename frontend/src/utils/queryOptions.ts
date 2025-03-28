import { queryOptions } from "@tanstack/react-query";
import { sessionsApi } from "../api/sessions";

export const authSessionQueryOptions = () =>
    queryOptions({
      queryKey: ["authSession"],
      queryFn: sessionsApi.getSession,
});