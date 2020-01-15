const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const keys = require('../../config/keys')

//Load input values
// const validateRegister = require('../../validation/register')

//Load user model
const User = require('../../models/User')

//Load admin model
const Admin = require('../../models/Admin')

//@router PUT api/admin/approve
