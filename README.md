# 🛍️ Wamia - Complete E-Commerce Mobile App

A comprehensive, feature-rich e-commerce and marketplace mobile application built with React Native. It provides a complete user journey from Browse products to secure checkout and order management.

[](https://opensource.org/licenses/MIT)
[](https://www.google.com/search?q=https://github.com/chakisahmed/wamia-git)

## ✨ Features

  * **Secure Authentication**: Multi-language support, Sign-in/Sign-up with Email or Phone, and OTP verification.
  * **Dynamic Home Page**: Engaging home screen with product showcases and walkthroughs.
  * **Advanced Product Catalog**: Browse by categories, search for products, and view detailed product pages.
  * **Full Cart & Checkout Flow**: Add items to cart, manage delivery addresses, multiple payment options, and a seamless checkout process.
  * **Order Management**: Track current orders, view order history, and write product reviews.
  * **User Profile**: Manage profile details, edit information, and view available coupons.
  * **Returns Management (RMA)**: System for users to request and track product returns.
  * **Customizable UI**: Features a gallery of reusable UI components and multiple footer styles for easy customization.

-----

## 📱 Screenshots


| Home Screen                                | Product Details                             | Cart & Checkout                            |
| ------------------------------------------ | ------------------------------------------- | ------------------------------------------ |
| *(Your Screenshot Here)* | *(Your Screenshot Here)* | *(Your Screenshot Here)* |

-----

## 🛠️ Tech Stack

  * **Framework**: [React Native](https://reactnative.dev/)
  * **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) (with Redux hooks)
  * **Data Fetching**: [Apollo Client](https://www.apollographql.com/docs/react/) for GraphQL & `fetch` for REST APIs.
  * **Navigation**: [React Navigation](https://reactnavigation.org/) (Stack, Bottom Tab, and Drawer navigators).
  * **Theming**: Custom theming solution using React's Context API.
  * **Custom Fonts**: Supports custom fonts like Jost and Cairo.

-----

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You need to have Node.js, Watchman, and the React Native CLI installed on your machine. You will also need either Android Studio (for Android) or Xcode (for iOS).

```bash
# Install Node.js (preferably using nvm)
# https://github.com/nvm-sh/nvm

# Install Watchman
brew install watchman
```

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/shopsphere.git](https://github.com/chakisahmed/wamia-git.git)
    cd shopsphere
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up environment variables:**
    Create a `.env` file in the root directory. Add your configuration keys for backend services (e.g., API endpoints, Apollo URI).
    ```
    # Example
    API_BASE_URL=https://api.example.com/
    APOLLO_GRAPHQL_URI=https://api.example.com/graphql
    ```
4.  **Link native dependencies (for iOS):**
    ```bash
    npx pod-install
    ```

### Running the App

  * **To run on an iOS simulator:**
    ```bash
    npm run ios
    ```
  * **To run on an Android emulator:**
    ```bash
    npm run android
    ```

-----

## 📂 Project Structure

The project follows a modular, feature-based architecture.

```
src/
├── api/             # API clients (Apollo) and data fetching logic.
├── assets/          # Static assets like fonts and images.
├── components/      # Reusable UI components (Buttons, Footers, etc.).
├── constants/       # Global constants and theme configuration.
├── navigation/      # React Navigation setup (stacks, tabs, drawer).
├── redux/           # Redux store, slices, and hooks.
├── screens/         # Top-level screen components, organized by feature.
└── utils/           # Helper functions and utilities.
```

-----

## 🙌 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

-----

## 📜 License

Distributed under the MIT License. See `LICENSE` file for more information.

-----

## 📧 Contact

Ahmed Chakis - [@ahmed-chakis](https://www.google.com/search?q=https://www.linkedin.com/in/ahmed-chakis-347901206) - chakisahmed@gmail.com

Project Link: [https://github.com/chakisahmed/wamia-git](https://www.google.com/search?q=https://github.com/chakisahmed/wamia-git)

