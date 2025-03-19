import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, Button, ScrollView} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

import AppLoading from '../hooks/AppLoading';
import CartCard from '../components/cart/CartCard';
import Summary from '../components/cart/Summary';
import EmptyCart from '../components/cart/EmptyCart';

const Cart = props => {
  const [isLoading, setIsLoading] = useState(false);
  const [indicator, setIndicator] = useState(false);
  const [cartItems, setCartItems] = useState();
  const [images, setImages] = useState();
  const userId = auth().currentUser.uid;

  const fetchItems = async () => {
    const userDetails = await firestore().collection('users').doc(userId).get();
    const imageStore = storage().ref();

    var fetchedUserCart = userDetails.data().cart;

    Object.keys(fetchedUserCart).map(dat => {
      fetchedUserCart[dat].quantity === 0 ? delete fetchedUserCart[dat] : null;
    });
    var imagesObject = {};

    await Promise.all(
      Object.keys(fetchedUserCart).map(async dat => {
        const mealImageURL = await firestore()
          .collection('meals')
          .doc(fetchedUserCart[dat].mealID)
          .get();
        imagesObject[fetchedUserCart[dat].mealID] =
          mealImageURL.data().imageURL;
      }),
    );

    await Promise.all(
      Object.keys(imagesObject).map(async dat => {
        const newURL = await imageStore
          .child(imagesObject[dat])
          .getDownloadURL();
        imagesObject[dat] = newURL;
      }),
    );
    setCartItems(fetchedUserCart);
    setImages(imagesObject);
  };

  useEffect(() => {
    const updateCart = () => {
      firestore().collection('users').doc(userId).update({
        cart: cartItems,
      });
    };
    cartItems === undefined ? null : updateCart();
  }, [cartItems]);
  if (!isLoading) {
    return (
      <AppLoading
        fetchItems={fetchItems}
        onFinish={() => {
          setIsLoading(true);
        }}
        onError={console.warn}
      />
    );
  }

  var totalValue = 0;
  Object.keys(cartItems).map(dat => {
    totalValue += cartItems[dat].quantity * cartItems[dat].price;
  });
  totalValue = Math.round(totalValue * 100) / 100;

  return Object.keys(cartItems).length === 0 ? (
    <View style={styles.emptyScreen}>
      <EmptyCart navigation={props.navigation} />
    </View>
  ) : indicator ? (
    <View style={styles.indicator}>
      <ActivityIndicator animating={true} size="large" color="blue" />
    </View>
  ) : (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 10}}>
        {Object.keys(cartItems).map(dat => (
          <CartCard
            key={dat}
            details={cartItems[dat]}
            imageURL={images[cartItems[dat].mealID]}
            setCartItems={setCartItems}
            cartMealID={dat}
          />
        ))}
      </ScrollView>
      <Summary
        totalValue={totalValue}
        cartItems={cartItems}
        setIsLoading={setIsLoading}
        setIndicator={setIndicator}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  indicator: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  emptyScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    overflow: 'hidden',
    marginBottom: 10,
  },
});

export default Cart;
