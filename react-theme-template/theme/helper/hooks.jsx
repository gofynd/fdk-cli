import { useGlobalStore } from "fdk-core/utils";

export function useLoggedInUser(fpi) {
  const userData=  useGlobalStore(fpi.getters.USER_DATA);
  const loggedIn = useGlobalStore(fpi.getters.LOGGED_IN);
  const userFetch = useGlobalStore(fpi.getters.USER_FETCHED)

  return {
    userData,
    loggedIn: loggedIn,
    userFetch 
}

}
