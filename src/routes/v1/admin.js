const express = require('express');
const router = express.Router();
const albumController = require('../../controllers/admin/albums');

router.get('/albums/', albumController.list);

router.get('/albums/create', albumController.create);

router.post('/albums/create', albumController.processCreate);

router.get('/albums/edit/:album_id', albumController.edit);

router.post('/albums/edit/:album_id', albumController.processEdit);

module.exports = router;
