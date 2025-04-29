const withPWA = require('next-pwa')({
  dest: 'public', // servis worker'ı buraya yerleştirir
  register: true,
  skipWaiting: true,
});

module.exports = withPWA({
});