import { SET_CURRENT_USER, USER_LOADING, SET_ADMIN } from "../actions/types";

const isEmpty = require("is-empty");

const initialState = {
  isAuthenticated: false,
  user: {},
  loading: false
};

const initialState2 = {
  isAuthenticated: false,
  isAdmin: false,
  user: {},
  loading: false
};

export default function(state = initialState, action, state2 = initialState2) {
  switch (action.type) {
    case SET_CURRENT_USER:
      return {
        ...state,
        isAuthenticated: !isEmpty(action.payload),
        user: action.payload
      };
    case SET_ADMIN:
      return {
        ...state2,
        isAuthenticated: !isEmpty(action.payload),
        isAdmin: true,
        user: action.payload
      };
    case USER_LOADING:
      return {
        ...state,
        loading: true
      };
    default:
      return state;
  }
}