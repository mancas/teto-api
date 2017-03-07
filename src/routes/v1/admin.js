const express = require('express');
const router = express.Router();
const albumController = require('../../controllers/admin/albums');
const userController = require('../../controllers/admin/users');

// ALBUMS
router.get('/albums', albumController.list);

router.get('/albums/:album_id', albumController.get);

router.post('/albums', albumController.processCreate);

router.put('/albums/:album_id', albumController.processEdit);

router.delete('/albums/:album_id', albumController.removeAlbum);

// IMAGES


// USERS
router.get('/users', userController.list);

router.get('/users/:user_id', userController.get);

router.post('/users', userController.processCreate);

router.put('/users/:user_id', userController.processEdit);

router.delete('/users/:user_id', userController.removeUser);



module.exports = router;
