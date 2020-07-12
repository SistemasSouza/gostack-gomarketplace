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
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsStoraged = await AsyncStorage.getItem(
        '@gomarkeplace:products',
      );

      if (productsStoraged) setProducts(JSON.parse(productsStoraged));
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      const productIndex = products.findIndex(item => item.id === product.id);

      const productsArray = [...products];

      if (productIndex < 0) {
        productsArray.push({ ...product, quantity: 1 });

        setProducts(productsArray);

        await AsyncStorage.setItem(
          '@gomarkeplace:products',
          JSON.stringify(productsArray),
        );

        return;
      }

      const productNew = productsArray[productIndex];

      productNew.quantity += 1;

      productsArray[productIndex] = productNew;
      setProducts(productsArray);

      await AsyncStorage.setItem(
        '@gomarkeplace:products',
        JSON.stringify(productsArray),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productsArray = products.map(product => {
        if (product.id === id) {
          return {
            ...product,
            quantity: product.quantity + 1,
          };
        }

        return product;
      });

      setProducts(productsArray);

      await AsyncStorage.setItem(
        '@gobarber:produtcs',
        JSON.stringify(productsArray),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      let productsArray = products.map(item => {
        if (item.id === id) {
          return {
            ...item,
            quantity: item.quantity - 1,
          };
        }

        return item;
      });

      productsArray = productsArray.filter(item => item.quantity > 0);

      setProducts(productsArray);

      await AsyncStorage.setItem(
        '@gobarber:produtcs',
        JSON.stringify(productsArray),
      );
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
