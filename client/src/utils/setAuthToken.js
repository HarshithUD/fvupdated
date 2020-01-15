import axios from 'axios';

const setAuthToken = token => {
    if(token) {
        //Apply authorization request to every token if logged in
        axios.defaults.headers.common["Authorizaion"] = token;
    }
    else {
        //Delete Auth header
        delete axios.defaults.headers.common["Authorization"];
    }
};

export default setAuthToken;