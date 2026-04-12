export const AUTH_UPDATED_EVENT = "toamhoanhao-auth-updated";

export const dispatchAuthUpdated = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(AUTH_UPDATED_EVENT));
};
