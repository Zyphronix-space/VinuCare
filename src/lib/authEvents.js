// Login/logout/signup all happen deep inside various page components and
// just call localStorage.setItem/removeItem('user', ...) + setUser(...)
// directly — there's no central place that "changing who's logged in"
// funnels through. ShopContext (cart/wishlist) lives above App in the tree
// and has no direct access to that user state, so it has no way to know
// the identity changed unless something tells it. This is that something:
// call notifyAuthChanged() anywhere the logged-in user is set/cleared, and
// anything that needs to react (see ShopContext's wishlist scoping) can
// listen for AUTH_CHANGED_EVENT.
export const AUTH_CHANGED_EVENT = 'vinucare:auth-changed';

export function notifyAuthChanged() {
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}
