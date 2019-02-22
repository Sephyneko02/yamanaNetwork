App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  loading: false,
  tokenPrice: 1000000000000000,
  tokensSold: 0,
  tokensAvailable: 360000000,

  init: function() {
    console.log("App initialized...")
    return App.initContracts();
  },

  initContracts: function() {
    $.getJSON("YamanaTokenSale.json", function(yamanaTokenSale) {
      App.contracts.YamanaTokenSale = TruffleContract(yamanaTokenSale);
      App.contracts.YamanaTokenSale.setProvider(App.web3Provider);
      App.contracts.YamanaTokenSale.deployed().then(function(yamanaTokenSale) {
        console.log("Yamana Token Sale Address:", yamanaTokenSale.address);
      });
    }).done(function() {
      $.getJSON("YamanaToken.json", function(yamanaToken) {
        App.contracts.YamanaToken = TruffleContract(yamanaToken);
        App.contracts.YamanaToken.setProvider(App.web3Provider);
        App.contracts.YamanaToken.deployed().then(function(yamanaToken) {
          console.log("Yamana Token Address:", yamanaToken.address);
        });

        App.listenForEvents();
        return App.render();
      });
    })
  },

  // Listen for events emitted from the contract
  listenForEvents: function() {
    App.contracts.YamanaTokenSale.deployed().then(function(instance) {
      instance.Sell({}, {
        fromBlock: 0,
        toBlock: 'latest',
      }).watch(function(error, event) {
        //console.log("event triggered", event);
        App.render();
      })
    })
  },

  render: function() {
    if (App.loading) {
      return;
    }
    App.loading = true;

    var loader  = $('#loader');
    var content = $('#content');

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if(err === null) {
        App.account = account;
      }
    })

    // Load token sale contract
    App.contracts.YamanaTokenSale.deployed().then(function(instance) {
      yamanaTokenSaleInstance = instance;
      return yamanaTokenSaleInstance.tokenPrice();
    }).then(function(tokenPrice) {
      App.tokenPrice = tokenPrice;
      $('.token-price').html(App.tokenPrice);

      console.log(tokenPrice);
      return yamanaTokenSaleInstance.tokensSold();
    }).then(function(tokensSold) {
      App.tokensSold = tokensSold.toNumber();
      $('.tokens-sold').html(App.tokensSold);
      $('.tokens-available').html(App.tokensAvailable);


      var progressPercent = (Math.ceil(App.tokensSold) / App.tokensAvailable) * 100;
      $('#progress').css('width', progressPercent + '%');

      App.contracts.YamanaToken.deployed().then(function(instance) {
        yamanaTokenInstance = instance;
        return yamanaTokenInstance.balanceOf(App.account);
      }).then(function(balance) {
        console.log(balance.toNumber());
        $('.yamana-balance').html(balance.toNumber());
        App.loading = false;
        loader.hide();
        content.show();
      })
    });
  },

  buyTokens: function() {
    var numberOfTokens = $('#numberOfTokens').val();
        console.log(numberOfTokens);

    console.log(numberOfTokens);

    App.contracts.YamanaTokenSale.deployed().then(function(instance) {
      return instance.buyTokens(numberOfTokens, {
        from: App.account,
        value: numberOfTokens * App.tokenPrice,
        gas: 500000 // Gas limit
      });
    }).then(function(result) {
      console.log("Tokens bought...")
      $('form').trigger('reset') // reset number of tokens in form
      // Wait for Sell event
    });
  }
}

$(function() {
  window.addEventListener('load', async () => {

    if (window.ethereum) {
      console.log("eth");
      eth = new Web3(ethereum);
      try {
        await ethereum.enable();
        App.web3Provider= eth.currentProvider;
        App.init();
      } catch (error) {
    
      }

    }
    // Legacy dapp browsers...
    else if (window.web3) {
      console.log("legacy");
      App.web3Provider = new web3(web3.currentProvider);
      web3 = new Web3(web3.currentProvider);
          App.init();
    }
    // Non-dapp browsers...
    else {
      console.log("Non-dapp");
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
          App.init();
    }
  });

});