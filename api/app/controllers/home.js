/**
 * Home/Index functions
 * @module app/controllers/home
 */
module.exports = {
  home: (req, res) => {
    res.json({msg: 'Anarik API v1'});
  },
};
