import { loadFromStorage, removeFromStorage, saveToStorage } from '../common/utils/index'
import React, { useEffect, useState } from 'react'
import { getAuth } from '../services/index'

interface ProductContextType {
  getListProduct: (newItem: DataProduct, callback: VoidFunction) => Promise<void>;
  listProduct: ([DataProduct]);
  addToCart: (item: DataProduct) => void;
  productInCart: ([DataProduct]);
  removeFromCart: () => void;
  getProductById: (id: DataProduct['id']) => Promise<void>;
  selectedItem: (DataProduct);
  totalMoney: number;
  onChangeQuantity: (quantity: DataProduct['quantity'], id: DataProduct['id']) => void;
  deleteItemInCart: (id: DataProduct['id']) => void;
}

interface DataProduct  {
    id: number;
    name: string;
    price: number;
    description?: string;
    type?: string;
    brand?: string;
    photos: string;
    createdAt?: Date;
    updateAt?: Date;
    quantity?: number;
}

export interface ListProductResponse {
  data: any[];
  statusCode: number;
}

export interface Item {
  data: DataProduct;
  statusCode: number;
}

export const ProductContext = React.createContext<ProductContextType>(null!)

export function ProductContextProvider({ children } : {children: React.ReactNode}) {
  const [listProduct, setListProduct] = useState<any>()
  const [productInCart, setItemInCart] = useState<any>(
    loadFromStorage('DataItem') || []
  )
  const [selectedItem, setSlectedItem] = useState<DataProduct>(
    loadFromStorage('DataItem') || []
  )
  const [totalMoney, setTotalMoney] = useState<number>(0)

  const getListProduct = async (newItem: DataProduct , callback: VoidFunction) => {
    const params = 1
    const headers = 2
    const response: ListProductResponse = await getAuth('http://localhost:3000/api/v1/product', params, headers)
    setListProduct(response.data[0])

    if (callback) {
      callback()
    }
  }

  useEffect(() => {
    const listItemAndCost: number[] =(productInCart || []).map(
      (item: DataProduct) => item.price * (item.quantity || 1)
    )
    const totalMoneyFinal = Object.values(listItemAndCost).reduce(
      (accumulator, curr) => accumulator + curr,
      0
    )
    setTotalMoney(totalMoneyFinal)
  }, [productInCart])

  const addToCart = (item: DataProduct) => {
    const dataCart = [
      ...productInCart,
      {
        ...item,
        quantity: 1,
      },
    ]

    setItemInCart(dataCart)
    saveToStorage('DataItem', dataCart)
  }

  const getProductById = async (id: DataProduct['id']) => {
    const params = 1
    const headers = 2
    const response: Item = await getAuth(`http://localhost:3000/api/v1/product/${id}`, params, headers)
    setSlectedItem(response.data)
  }

  const removeFromCart = () => {
    setItemInCart([])
    removeFromStorage('DataItem')
  }

  const onChangeQuantity = (quantity: DataProduct['quantity'], id: DataProduct['id']) => {
    const updatedProductInCart = productInCart.map((item: DataProduct) => {
      if (item.id === id) {
        item.quantity = quantity
        return item
      }
      return item
    })

    setItemInCart(updatedProductInCart)
    saveToStorage('DataItem', updatedProductInCart)
  }

  const deleteItemInCart = (id: number) => {
    const updatedProductInCart = productInCart.filter((item: DataProduct['id']) => item !== id)
    
    setItemInCart(updatedProductInCart)
    saveToStorage('DataItem', updatedProductInCart)
  }

  const value = {
    getListProduct,
    listProduct,
    addToCart,
    productInCart,
    removeFromCart,
    getProductById,
    selectedItem,
    totalMoney,
    onChangeQuantity,
    deleteItemInCart,
  }

  return (
    <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
  )
}
