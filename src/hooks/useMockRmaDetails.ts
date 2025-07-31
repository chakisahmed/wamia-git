// Mock data for testing RMA Details component
export const mockRmaDetails = {
  id: 12345,
  rmaStatus: "processing",
  orderRef: "ORD-2025-001234",
  createdDate: "2025-06-20 14:30:25",
  orderStatus: "shipped",
  resolutionType: "refund",
  additionalInfo: "Customer reported that the product arrived damaged during shipping. The packaging was intact but the item inside had visible scratches and dents. Customer provided photos and requested a full refund.",
  images: [
    "https://picsum.photos/400/400?random=1",
    "https://picsum.photos/400/400?random=2", 
    "https://picsum.photos/400/400?random=3",
    "https://picsum.photos/400/400?random=4"
  ],
  product: [
    {
      name: "Samsung Galaxy S24 Ultra 256GB",
      price: "1199.99",
      qty: 1,
      reason: "Arrived damaged - visible scratches on screen",
      customer: {
        email: "seller@techstore.com"
      }
    },
    {
      name: "Wireless Charging Pad",
      price: "29.99", 
      qty: 2,
      reason: "Not compatible with phone model",
      customer: {
        email: "accessories@mobilehub.com"
      }
    }
  ],
  conversations: [
    {
      sender: "John Smith",
      senderType: "customer",
      message: "Hi, I received my order yesterday but the phone has scratches on the screen. I'd like to return it for a refund.",
      created: "2025-06-20 14:35:00"
    },
    {
      sender: "Sarah Johnson", 
      senderType: "customer_service",
      message: "Hello John, I'm sorry to hear about the damaged product. Could you please provide photos of the damage so we can process your RMA request?",
      created: "2025-06-20 15:20:15"
    },
    {
      sender: "John Smith",
      senderType: "customer", 
      message: "Sure, I've uploaded photos showing the scratches. They're quite visible and definitely not normal wear.",
      created: "2025-06-20 16:45:30"
    },
    {
      sender: "Mike Chen",
      senderType: "quality_assurance",
      message: "Thank you for the photos. We've reviewed the damage and approve this RMA for a full refund. We'll send you a return shipping label shortly.",
      created: "2025-06-21 09:15:22"
    },
    {
      sender: "Sarah Johnson",
      senderType: "customer_service", 
      message: "Your return label has been sent to your email. Once we receive the items, your refund will be processed within 3-5 business days.",
      created: "2025-06-21 10:30:45"
    }
  ]
};

// Mock data for different RMA statuses for testing
export const mockRmaList = [
  {
    id: 12345,
    orderRef: "ORD-2025-001234",
    rmaStatus: "processing",
    createdDate: "2025-06-20 14:30:25"
  },
  {
    id: 12346,
    orderRef: "ORD-2025-001235", 
    rmaStatus: "pending",
    createdDate: "2025-06-19 09:15:30"
  },
  {
    id: 12347,
    orderRef: "ORD-2025-001236",
    rmaStatus: "approved", 
    createdDate: "2025-06-18 16:45:12"
  },
  {
    id: 12348,
    orderRef: "ORD-2025-001237",
    rmaStatus: "rejected",
    createdDate: "2025-06-17 11:20:45"
  },
  {
    id: 12349,
    orderRef: "ORD-2025-001238",
    rmaStatus: "completed",
    createdDate: "2025-06-15 13:55:18"
  }
];

// Usage in your component or hook:
// For testing the details component:
export const useRmaDetailsMock = (rmaId: string) => {
  return {
    rmaDetails: mockRmaDetails,
    isLoading: false,
    error: null,
    refetch: () => {}
  };
};

// For testing the list component:
export const useCustomerRMAMock = (customerId: string) => {
  return {
    rmas: mockRmaList,
    isLoading: false, 
    error: null,
    refetch: () => {}
  };
};