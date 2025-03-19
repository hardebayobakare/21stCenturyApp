import React from 'react';
import {View, Text, StyleSheet, Dimensions, Image} from 'react-native';

import {Avatar} from 'react-native-elements';
import {SwipeListView} from 'react-native-swipe-list-view';

import RightIcon from './RightIcon';
import DetailCounter from './DetailCounter';
import CategoryTile from '../CategoryTile';
import Colors from '../../constants/Colors';
import EditButton from './EditButton';

const height = Dimensions.get('screen').height;
const width = Dimensions.get('screen').width;

const CartCard = ({cartMealID, details, imageURL, setCartItems}) => {
  const {available, mealID, name, price, quantity, mealName, category} =
    details;

  return (
    <View style={styles.container}>
      <Avatar
        rounded
        source={{uri: imageURL}}
        style={{height: height / 10, width: '25%'}}
      />
      <View style={styles.textContainer}>
        <Text
          style={{
            fontSize: 18,
            fontFamily: 'robotoRegular',
            fontWeight: 'bold',
            paddingHorizontal: 3,
          }}
          numberOfLines={2}>
          {mealName}
        </Text>
        <Text
          style={{
            fontSize: 17,
            fontFamily: 'robotoLight',
          }}
          numberOfLines={2}>
          {name}
        </Text>
        <CategoryTile
          text={`Rs ${price}`}
          containerStyle={{
            backgroundColor: 'rgba(0,65,255,0.2)',
            borderColor: Colors['Navy Blue'],
          }}
          textStyle={{color: Colors['Navy Blue']}}
        />
      </View>
      <View style={styles.detailContainer}>
        <DetailCounter
          cartMealID={cartMealID}
          setCartItems={setCartItems}
          details={details}
          quantity={quantity}
        />
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
          }}>
          {category === 'Cake' ? <EditButton cartMealID={cartMealID} /> : null}
          <RightIcon
            cartMealID={cartMealID}
            setCartItems={setCartItems}
            details={details}
            quantity={quantity}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 0.001,
    borderRadius: 30,
    overflow: 'hidden',
    marginHorizontal: 10,
    marginTop: 10,
    elevation: 2,
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    width: '45%',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  detailContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: -10,
  },
});

export default CartCard;
