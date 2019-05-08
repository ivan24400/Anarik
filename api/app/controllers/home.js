/**
 * Home/Index functions
 * @module app/controllers/home
 * @requires path
 */
module.exports = {
  home: (req, res) => {
    res.json({msg: 'Anarik API v1'});
  },
};
