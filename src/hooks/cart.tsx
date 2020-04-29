import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // await AsyncStorage.clear();
      const products = await AsyncStorage.getItem('@GoMarketplace:products');

      if (products) {
        setProducts(JSON.parse(products));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productIndex = products.findIndex(item => item.id === product.id);

      if (productIndex < 0) {
        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify([...products, product]),
        );

        setProducts([...products, product]);
      } else {
        products[productIndex].quantity += 1;

        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify([...products]),
        );

        setProducts([...products]);
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productIndex = products.findIndex(item => item.id === id);
      products[productIndex].quantity += 1;

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify([...products]),
      );

      setProducts([...products]);
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productIndex = products.findIndex(item => item.id === id);
      const qty = products[productIndex].quantity;

      if (qty > 1) {
        products[productIndex].quantity -= 1;

        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify([...products]),
        );

        setProducts([...products]);
      } else {
        products.splice(productIndex, 1);
        setProducts([...products]);
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
