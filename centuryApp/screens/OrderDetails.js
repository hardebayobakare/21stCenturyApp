import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView, Alert} from 'react-native';

import firestore from '@react-native-firebase/firestore';

import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import axios from 'axios';
import {showMessage} from 'react-native-flash-message';
import AppLoading from '../hooks/AppLoading';

import OrderDetailCard from '../components/Order/OrderDetailCard';
import ProgressBar from '../components/Order/ProgressBar';
import SummaryDetails from '../components/Order/SummaryDetails';
import AddressType from '../components/Order/AddressType';
import CancelButton from '../components/Order/CancelButton';
import TotalText from '../components/Order/TotalText';

const OrderDetails = props => {
  const {orderID, total} = props.route.params;

  const [isLoading, setIsLoading] = useState(false);
  const [orderData, setOrderData] = useState();
  const [date, setDate] = useState();
  const [status, setStatus] = useState();

  const fetchItems = async () => {
    const order = await firestore().collection('orders').doc(orderID).get();
    const fetchedOrderData = order.data();
    await Promise.all(
      Object.keys(fetchedOrderData['meals']).map(async dat => {
        const meal = await firestore().collection('meals').doc(dat).get();
        const mealData = meal.data();
        const newURL = await storage()
          .ref()
          .child(mealData.imageURL)
          .getDownloadURL();
        fetchedOrderData['meals'][dat]['mealName'] = mealData.name;
        fetchedOrderData['meals'][dat]['imageURL'] = newURL;
        fetchedOrderData['meals'][dat]['rating'] = mealData.rating;
      }),
    );
    // Updating Refund Status
    if (fetchedOrderData.isCancel) {
      const token = await auth().currentUser.getIdToken();
      const serResponse = await axios.get(
        `${process.env.SERVER_URL}/transactionStatus?orderID=${orderID}&token=${token}&refund=true`,
      );
      // console.log(serResponse.data);
    }
    setOrderData(fetchedOrderData);
    setDate(fetchedOrderData.createdAt);
    setStatus(fetchedOrderData.status);
  };

  const cancelOrder = async () => {
    try {
      const token = await auth().currentUser.getIdToken();
      const serResponse = await axios.get(
        `${process.env.SERVER_URL}/refundTransaction?orderID=${orderID}&token=${token}`,
      );
      // console.log(serResponse.data);
    } catch (err) {
      console.log(err.message);
      showMessage({
        message: 'Order Cancelled',
        description: 'Order Cancel successfully!!!!',
        type: 'success',
      });
    }
  };

  useEffect(() => {
    const onResult = () => {
      setIsLoading(false);
    };
    const unsubscribe = firestore().collection('orders').onSnapshot(onResult);

    return () => unsubscribe();
  }, []);

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
  return (
    <View style={styles.screen}>
      <ScrollView>
        {Object.keys(orderData['meals']).map((dat, idx) => {
          return (
            <OrderDetailCard
              orderData={orderData['meals'][dat]}
              key={idx}
              orderID={orderID}
              mealID={dat}
              status={status}
            />
          );
        })}
        <View style={{marginBottom: 10}}></View>
      </ScrollView>
      <View style={styles.bottomContainer}>
        <AddressType order={orderData} />
        <ProgressBar
          isAccept={orderData.isAccept}
          isCancel={orderData.isCancel}
          status={status}
          refund={
            orderData.isCancel
              ? orderData.refund.resultInfo.resultStatus
              : false
          }
        />
        <SummaryDetails totalValue={total / 1.05} />
        <View style={styles.totalContainer}>
          <TotalText total={total} />
          <CancelButton
            isAccept={orderData.isAccept}
            isCancel={orderData.isCancel}
            status={status}
            cancelOrder={cancelOrder}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  bottomContainer: {
    height: '40%',
    backgroundColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
  },
  bottomText: {
    textAlign: 'left',
    fontSize: 20,
    fontFamily: 'robotoLight',
  },
  totalContainer: {
    flexDirection: 'row',
    height: '15%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default OrderDetails;
