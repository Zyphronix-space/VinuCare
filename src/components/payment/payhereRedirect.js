// Builds a hidden HTML form with the exact fields PayHere's hosted
// checkout expects, and submits it — this navigates the browser to
// PayHere's sandbox/live checkout page. PayHere then redirects back to
// return_url (success) or cancel_url (user backed out), and separately
// POSTs to notify_url server-to-server once the payment is verified.
//
// user info (name/email) comes from the logged-in account; phone/address
// fields aren't collected elsewhere in VinuCare yet, so reasonable
// placeholders are used — swap these for a real billing form later if
// you want PayHere to capture accurate customer details.
export function submitToPayHere({ checkoutUrl, merchantId, hash, amount, currency, orderId, rawOrderId, orderType, user, itemsDescription, notifyUrl }) {
  const FRONTEND_URL = window.location.origin;

  const [firstName, ...rest] = (user?.name || 'VinuCare Customer').split(' ');
  const lastName = rest.join(' ') || firstName;

  const fields = {
    merchant_id: merchantId,
    return_url: `${FRONTEND_URL}/payment-return?orderType=${orderType}&orderId=${rawOrderId}`,
    cancel_url: `${FRONTEND_URL}/payment-cancel?orderType=${orderType}&orderId=${rawOrderId}`,
    notify_url: notifyUrl,
    order_id: orderId,
    items: itemsDescription || 'VinuCare payment',
    currency,
    amount,
    hash,
    first_name: firstName,
    last_name: lastName,
    email: user?.email || 'customer@example.com',
    phone: '0770000000',
    address: 'No. 1, Main Street',
    city: 'Colombo',
    country: 'Sri Lanka',
  };

  const form = document.createElement('form');
  form.method = 'POST';
  form.action = checkoutUrl;

  Object.entries(fields).forEach(([name, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}