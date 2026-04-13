import React, { createContext, useState, useEffect } from 'react';

export const ShopContext = createContext(null);

const getDefaultCart = () => {
    let cart = {};
    for (let index = 0; index < 301; index++) {
        cart[index] = 0;
    }
    return cart;
};

const ShopContextProvider = (props) => {

    const [all_product, setAll_Product] = useState([]);
    const [cartItems, setCartItems] = useState(getDefaultCart());

    //  LOAD PRODUCTS + CART
    useEffect(() => {

        fetch(`${process.env.REACT_APP_API_URL}/allproducts`)
        .then((response)=>response.json())
        .then((data)=>setAll_Product(data));

        const token = localStorage.getItem('auth-token');

        if(token){
            fetch(`${process.env.REACT_APP_API_URL}/getcart`,{
                method:'POST',
                headers:{
                    'auth-token': token,
                    'Content-Type':'application/json',
                }
            })
            .then((res)=>res.json())
            .then((data)=>setCartItems(data));
        }

    },[]);

    //  ADD TO CART (FIXED)
    const addToCart = (itemId) => {

        const token = localStorage.getItem('auth-token');

        //  NOT LOGGED IN
        if (!token) {
            alert("Please login first to add items to cart!");
            window.location.href = "/login";
            return;
        }

        // ✅ UI UPDATE
        setCartItems((prev) => ({
            ...prev,
            [itemId]: prev[itemId] + 1
        }));

        // ✅ BACKEND UPDATE
        fetch(`${process.env.REACT_APP_API_URL}/addtocart`, {
            method: 'POST',
            headers:{
                "auth-token": token,
                "Content-Type":"application/json",
            },
            body: JSON.stringify({ itemId }),
        })
        .then((response)=> response.json())
        .then((data)=>console.log(data));
    };

    // 🔥 REMOVE FROM CART (FIXED)
    const removeFromCart = (itemId) => {

        const token = localStorage.getItem('auth-token');

        if (!token) {
            alert("Please login first 🛒");
            return;
        }

        setCartItems((prev) => ({
            ...prev,
            [itemId]: prev[itemId] > 0 ? prev[itemId] - 1 : 0
        }));

        fetch(`${process.env.REACT_APP_API_URL}/removefromcart`, {
            method: 'POST',
            headers:{
                "auth-token": token,
                "Content-Type":"application/json",
            },
            body: JSON.stringify({ itemId }),
        })
        .then((response)=> response.json())
        .then((data)=>console.log(data));
    };

    // 🔥 TOTAL PRICE
    const getTotalCartAmount = () => {
        let totalAmount = 0;

        for(const item in cartItems) {
            if(cartItems[item] > 0){
                let itemInfo = all_product.find(
                    (product)=>product.id === Number(item)
                );
                if(itemInfo){
                    totalAmount += itemInfo.new_price * cartItems[item];
                }
            }
        }

        return totalAmount;
    };

    // 🔥 TOTAL ITEMS
    const getTotalCartItems = () => {
        let totalItem = 0;

        for(const item in cartItems){
            if(cartItems[item] > 0){
                totalItem += cartItems[item];
            }
        }

        return totalItem;
    };

    const contextValue = {
        getTotalCartItems,
        getTotalCartAmount,
        all_product,
        cartItems,
        addToCart,
        removeFromCart
    };

    return (
        <ShopContext.Provider value={contextValue}>
            {props.children}
        </ShopContext.Provider>
    );
};

export default ShopContextProvider;