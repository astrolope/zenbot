var z = require('zero-fill')
  , n = require('numbro');

module.exports = function container(get, set, clear) {
  return {
    name: 'aroon',
    description: 'Attempts to buy low and sell high by tracking RSI high-water readings.',

    getOptions: function () {
      this.option('period', 'period length', String, '5m')
      this.option('min_periods', 'min. number of history periods', Number, 52)
      this.option('rsi_periods', 'number of RSI periods', 14)
      this.option('aroon_period', 'lookback cutoff for aroon periods', 25)
      this.option('buy_aroon', 'buy when aroon down surges above this level', 90)
      this.option('sell_aroon_up', 'sell when aroon up surges above this level', 90)
      this.option('sell_aroon_down', 'sell when aroon down surges below this level', 23)
      this.option('aroon_error', 'modify aroon by this amount', 4)
      this.option('oversold_rsi', 'buy when RSI reaches or drops below this value', Number, 30)
      this.option('overbought_rsi', 'sell when RSI reaches or goes above this value', Number, 82)
      this.option('rsi_recover', 'allow RSI to recover this many points before buying', Number, 3)
      this.option('rsi_drop', 'allow RSI to fall this many points before selling', Number, 0)
      this.option('rsi_divisor', 'sell when RSI reaches high-water reading divided by this value', Number, 2)
    },

    calculate: function (s) {
      get('lib.rsi')(s, 'rsi', s.options.rsi_periods)
      get('lib.aroon')(s,s.options.rsi_periods)
      //console.log(s.lookback.length, function_desc);

    },

    onPeriod: function (s, cb) {
      if (s.in_preroll) return cb()

        //TODO: finetune options and cutoff points.
  /*
      if (typeof s.period.rsi === 'number') {
        //console.log(s);
        if (s.trend !== 'oversold' && s.trend !== 'long' && s.period.rsi <= s.options.oversold_rsi) {
          s.rsi_low = s.period.rsi
          s.trend = 'oversold'
        }
        if (s.trend === 'oversold') {
          s.rsi_low = Math.min(s.rsi_low, s.period.rsi)
          if (s.period.rsi >= s.rsi_low + s.options.rsi_recover) {
            s.trend = 'long'
            s.signal = 'buy'
            s.rsi_high = s.period.rsi
          }
        }
        if (s.trend === 'long') {
          s.rsi_high = Math.max(s.rsi_high, s.period.rsi)
          if (s.period.rsi <= s.rsi_high / s.options.rsi_divisor) {
            s.trend = 'short'
            s.signal = 'sell'
          }
        }
        if (s.trend === 'long' && s.period.rsi >= s.options.overbought_rsi) {
          s.rsi_high = s.period.rsi
          s.trend = 'overbought'
        }
        if (s.trend === 'overbought') {
          s.rsi_high = Math.max(s.rsi_high, s.period.rsi)
          if (s.period.rsi <= s.rsi_high - s.options.rsi_drop) {
            s.trend = 'short'
            s.signal = 'sell'
          }
        }
      }
      */
      if(s.period.aroon_up == 100 && s.period.aroon_down <= 5) {
        console.log('should sell');
        s.signal = 'sell'
      }

      if(s.period.aroon_up == 100 && s.period.rsi >= 75)
      {
        s.signal = 'sell'
      }

      if(s.period.aroon_down == 100 && s.period.aroon_up <= 50 && s.period.rsi <= 30) {
        console.log('should buy');
        s.signal = 'buy'
      }
            
      if(s.period.aroon_down == 100 && s.period.rsi <= 30) {
        console.log('should buy');
        //s.signal = 'buy'
      } 
      cb()
    },

    onReport: function (s) {
      var cols = []
      //console.log(s);
      if (typeof s.period.rsi === 'number') {
        var color = 'grey'
        if (s.period.rsi <= s.options.oversold_rsi) {
          color = 'green'
        }
        cols.push(z(4, n(s.period.rsi).format('0'), ' ')[color])

        cols.push(z(4, n(s.period.aroon_up).format('0'), ' ')['green'])
        
        cols.push(z(4, n(s.period.aroon_down).format('0'), ' ')['red'])
        cols.push(z(4, n(s.period.since_high).format('0'), ' ')['green'])
        cols.push(z(4, n(s.period.since_low).format('0'), ' ')['red'])
      }
      return cols
    }
  }
}