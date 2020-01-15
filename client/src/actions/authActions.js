import axios from 'axios'
import setAuthToken from '../utils/setAuthToken'
import jwt_decode from 'jwt-decode'
import Swal from 'sweetalert2'

import {
    GET_ERRORS,
    SET_CURRENT_USER,
    SET_ADMIN,
    USER_LOADING
} from './types'

//Register User
export const registerUser = (userData, history) => dispatch => {
    axios
    .post("/api/users/register", userData)
    .then(res => {
        if(res.statusText === "OK"){
        Swal.close();
        // document.getElementById('RegOtp').classList.add('show','d-block'); **Enable OTP
        Swal.fire(
            'Registration Successful!!',
            'Please Login and Proceed.',
            'success'
        )
        history.push("/signup")
        }
        else{
            Swal.fire(
                'Registration Failed!!',
                'Please Try Again',
                'error'
            )
        }
        }
    ) //redirect to login on success
    .catch(err => {
        Swal.close();
        dispatch({
            type: GET_ERRORS,
            payload: err.response.data
        })
    });
};

//Login - get user token
export const loginUser = userData => dispatch => {
    axios
    .post("/api/users/login", userData)
    .then(res => {
        // console.log(res);
        Swal.close()
        //Save to local storage

        //Set token to local storage
        const { token } = res.data;
        //Decode token to get user data
        const decoded = jwt_decode(token);
            localStorage.setItem("jwtToken", token);
            //Set token to Auth Header
            setAuthToken(token);
            //Set Current user
            dispatch(setCurrentUser(decoded));
    })
    .catch(err => {
        Swal.close();
        dispatch({
          type: GET_ERRORS,
          payload: err.response.data
        })
    });
}


//Change Pass - get user token
export const changePass = userData => dispatch => {
    axios
    .post("/api/users/updatePass", userData)
    .then(res => {
        // console.log(res);
        Swal.close();
        document.getElementById('ModalCenter').classList.add('show','d-block');
    })
    .catch(err => {
        Swal.close();
        dispatch({
          type: GET_ERRORS,
          payload: err.response.data
        })
    });
}


//Update Pass - get user token
export const updatePass = userData => dispatch => {
    axios
    .post("/api/users/putPass", userData)
    .then(res => {
        // console.log(res);
        Swal.close();
        Swal.fire({
            title:'Password Updated!',
            text:'Please Login with your new Password',
            type: "success",
            onAfterClose:() => {
                window.location = '/signup'
            }
        })
    })
    .catch(err => {
        Swal.close();
        dispatch({
          type: GET_ERRORS,
          payload: err.response.data
        })
    });
}

//Login - get admin token
export const loginAdmin = userData => dispatch => {
    axios
    .post("/api/users/admin2019", userData)
    .then(res => {
        Swal.close()
        //Save to local storage
        //Set token to local storage
        const { token } = res.data;
        localStorage.setItem("jwtToken", token);
        //Set token to Auth Header
        setAuthToken(token);
        //Decode token to get user data
        const decoded = jwt_decode(token);
        //Set Current user
        dispatch(setCurrentAdmin(decoded));     
    })
    .catch(err => {
        Swal.close();
        dispatch({
          type: GET_ERRORS,
          payload: err.response.data
        })
    });
}

//Login - get admin token
export const LogOtp = userData => dispatch => {
    axios
    .post("/api/verify/updateOtp", userData)
    .then(res => {
        Swal.close()
        document.getElementById('ModalCenter').classList.add('show','d-block');
        //Save to local storage
        //Set token to local storage
        console.log(res)    
    })
    .catch(err => {
        Swal.close();
        dispatch({
          type: GET_ERRORS,
          payload: err.response.data
        })
    });
}

//Set logged in user
export const setCurrentUser = decoded => {
    return {
        type: SET_CURRENT_USER,
        payload: decoded
    };
};
//Set logged in Admin
export const setCurrentAdmin = decoded => {
    return {
        type: SET_ADMIN,
        payload: decoded
    };
};

// User loading
export const setUserLoading = () => {
    return {
        type: USER_LOADING
    }
}
//Logout User
export const logoutUser = () => dispatch => {
    //Remove token from local storage
    localStorage.removeItem("jwtToken");
    //Remove auth Header for future requests
    setAuthToken(false);
    //Set current user to empty objects {} which gives isAuthenticated false
    dispatch(setCurrentUser({}));
}

//Logout User
export const logoutAdmin = () => dispatch => {
    //Remove token from local storage
    localStorage.removeItem("jwtToken");
    //Remove auth Header for future requests
    setAuthToken(false);
    //Set current user to empty objects {} which gives isAuthenticated false
    dispatch(setCurrentAdmin({}));
}

export const contactData = contactData => dispatch => {
    axios.
    post('/api/users/contactData',contactData)
    .then(result => {
        if(result.data){
        Swal.close();
        Swal.fire(
            'Query Submitted Successfully!!',
            '',
            'success'
        )
        }
        else{
            Swal.close();
            Swal.fire(
                'Query Submition Failed!!',
                'Please try Again',
                'error'
            )
        }
    })
}

export const updateUserDetails = (userData,formData,config) => dispatch => {
    axios.post('/api/users/updateSelfie',formData,config)
    .then(res => {
        if(res.data.status){
            axios.put('/api/users/updateDetails',userData)
            .then( result => {
                Swal.close();
                Swal.fire(
                    'Details Updated Successfully!!',
                    '',
                    'success'
                )
            })
            .catch(err => {
                Swal.fire(
                    'User Details Update failed!!',
                    'Please Try again!.',
                    'error'
                )
                dispatch({
                  type: GET_ERRORS,
                  payload: err
                })
            });
        }
        else{
                Swal.fire(
                    'Error while uploading image!',
                    !res.data.status && res.data.message,
                    'error'
                )
        }
    })
}

export const updateAdmin = adminData => dispatch => {
    axios.put('/api/users/updateAdminDetails',adminData)
    .then( res => {
        Swal.close();
        Swal.fire(
            'Settings Updated Successfully!!',
            '',
            'success'
        )
    })
    .catch(err => {
        Swal.fire(
            'Settings Update failed!!',
            'Please Try again!.',
            'error'
        )
        dispatch({
          type: GET_ERRORS,
          payload: err
        })
    });
}