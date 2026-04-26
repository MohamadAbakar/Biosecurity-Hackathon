const ArduinoService = require('../services/arduinoService');

const connect = async (req, res, next) => {
  try {
    await ArduinoService.getInstance().connect();
    res.json({ success: true, message: 'Arduino connected' });
  } catch (err) {
    // connect() rejects when the port cannot be opened
    res.status(503).json({ success: false, message: `Connection failed: ${err.message}` });
  }
};

const disconnect = async (req, res, next) => {
  try {
    await ArduinoService.getInstance().disconnect();
    res.json({ success: true, message: 'Device disconnected' });
  } catch (err) {
    next(err);
  }
};

const getStatus = (req, res) => {
  const status = ArduinoService.getInstance().getStatus();
  res.json({ success: true, status });
};

const sendCommand = async (req, res, next) => {
  try {
    const { command } = req.body;
    if (!command) {
      return res.status(422).json({ success: false, message: 'command is required' });
    }
    await ArduinoService.getInstance().sendCommand(command);
    res.json({ success: true, message: `Command sent: ${command}` });
  } catch (err) {
    res.status(503).json({ success: false, message: err.message });
  }
};

module.exports = { connect, disconnect, getStatus, sendCommand };
