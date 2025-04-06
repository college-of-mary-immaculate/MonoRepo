class HomeController {
  constructor() {
    this.__controllerName = 'Home';
  }


  indexAction(req, res) {
    res.json({
      'message': 'V1 API is App and Running!',
      'controller': this.__controllerName,
    });
    res.end();
  }
}

export default HomeController;
