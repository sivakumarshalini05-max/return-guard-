/**
 * Calculate deadlines, urgency status, and warranty status for an order
 */
export function calculateOrderDeadlines(data) {
  const orderDate = data.orderDate ? new Date(data.orderDate) : new Date();
  const deliveryDate = data.deliveryDate ? new Date(data.deliveryDate) : new Date(orderDate);

  const returnPeriodDays = parseInt(data.returnPeriod || 0, 10);
  const replacementPeriodDays = parseInt(data.replacementPeriod || 0, 10);
  const warrantyPeriodMonths = parseInt(data.warrantyPeriod || 0, 10);

  // Return Deadline = Delivery Date + returnPeriod
  const returnDeadline = new Date(deliveryDate);
  returnDeadline.setDate(returnDeadline.getDate() + returnPeriodDays);

  // Replacement Deadline = Delivery Date + replacementPeriod
  const replacementDeadline = new Date(deliveryDate);
  replacementDeadline.setDate(replacementDeadline.getDate() + replacementPeriodDays);

  // Warranty Expiry = Delivery Date + warrantyPeriod (months)
  const warrantyExpiry = new Date(deliveryDate);
  warrantyExpiry.setMonth(warrantyExpiry.getMonth() + warrantyPeriodMonths);

  // Current date normalized to midnight for accurate day comparison
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const returnDeadlineDay = new Date(returnDeadline.getFullYear(), returnDeadline.getMonth(), returnDeadline.getDate());
  const warrantyExpiryDay = new Date(warrantyExpiry.getFullYear(), warrantyExpiry.getMonth(), warrantyExpiry.getDate());

  const diffTime = returnDeadlineDay.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let urgencyStatus = 'Safe';
  if (daysRemaining < 0) {
    urgencyStatus = 'Expired';
  } else if (daysRemaining <= 1) {
    urgencyStatus = 'Critical';
  } else if (daysRemaining <= 3) {
    urgencyStatus = 'Urgent';
  } else {
    urgencyStatus = 'Safe';
  }

  const warrantyDiff = warrantyExpiryDay.getTime() - today.getTime();
  const warrantyDaysRemaining = Math.ceil(warrantyDiff / (1000 * 60 * 60 * 24));

  let warrantyStatus = 'None';
  if (warrantyPeriodMonths > 0) {
    if (warrantyDaysRemaining < 0) {
      warrantyStatus = 'Expired';
    } else if (warrantyDaysRemaining <= 30) {
      warrantyStatus = 'Expiring Soon';
    } else {
      warrantyStatus = 'Active';
    }
  }

  return {
    orderDate,
    deliveryDate,
    returnPeriod: returnPeriodDays,
    returnDeadline,
    replacementPeriod: replacementPeriodDays,
    replacementDeadline,
    warrantyPeriod: warrantyPeriodMonths,
    warrantyExpiry,
    daysRemaining,
    warrantyDaysRemaining,
    urgencyStatus,
    warrantyStatus
  };
}
