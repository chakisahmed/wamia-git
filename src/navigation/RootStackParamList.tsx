import { NavigatorScreenParams } from "@react-navigation/native";
import { BottomTabParamList } from "./BottomTabParamList";
import { OrderItem } from "@/api/orderApi";

export type RootStackParamList = {
    DrawerNavigation: NavigatorScreenParams<BottomTabParamList>;
    Demo: undefined;
    Walkthrough: undefined;
    ChooseLanguage: undefined;
    SignUp: undefined;
    SignIn: undefined;
    SignInPhone: {
        redirectTo?:string
    };
    OnBoarding: undefined;
    Login: undefined;
    Register: undefined;
    ForgotPassword: undefined;
    OTPAuthentication: undefined;
    ResetPassword: undefined;
    Settings: undefined;
    ChangePassword: undefined;
    TwoStepAuthentication: undefined;
    BottomNavigation: undefined;
    Singlechat: undefined;
    Chat: undefined;
    Support: undefined;
    History: undefined;
    Verification: undefined;
    Call: undefined;
    EditProfile: undefined;
    Trackorder: {
        order:OrderItem
    };
    Products: undefined;
    Language: undefined;
    MyCart: undefined;
    Category: undefined;
    Notifications: undefined;
    Questions: undefined;
    ProductsDetails: undefined;
    Writereview: undefined;
    Profile: undefined;
    Wishlist: undefined;
    Search: undefined;
    Components: undefined;
    Coupons: undefined;
    DeliveryAddress: undefined;
    Checkout: undefined;
    Addcard: undefined;
    Payment: undefined;
    AddDeliveryAddress: undefined;
    Myorder: undefined;
    Notification: undefined;
    Home: undefined;
    Accordion: undefined;
    BottomSheet: undefined;
    ModalBox: undefined;
    Buttons: undefined;
    Badges: undefined;
    Charts: undefined;
    Headers: undefined;
    lists: undefined;
    Pricings: undefined;
    DividerElements: undefined;
    Snackbars: undefined;
    Socials: undefined;
    Swipeable: undefined;
    Tabs: undefined;
    Tables: undefined;
    Toggles: undefined;
    Inputs: undefined;
    Footers: undefined;
    TabStyle1: undefined;
    TabStyle2: undefined;
    TabStyle3: undefined;
    TabStyle4: undefined;
    ListRMA: undefined;
    RMADetails: undefined;
    CreateRMA: {
        onSuccessfullCreate?: () => void;
        orderId?: number
    };
};