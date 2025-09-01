export interface Order {
  _id: string;
  items: Array<{
    product: {
      _id: string;
      name: string;
      price: number;
      image: string;
    };
    quantity: number;
  }>;
  totalAmount: number;
  status: 'placed' | 'preparing' | 'prepared' | 'out_for_delivery' | 'delivered';
  paymentMethod: 'online' | 'cod';
  paymentStatus: 'pending' | 'completed' | 'failed';
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: string;
}

export interface OrderInput {
  items: Array<{
    product: string; // just productId when sending to backend
    quantity: number;
  }>;
  totalAmount: number;
  paymentMethod: 'online' | 'cod';
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  razorpayOrderId?: string;
}
