angular.module('lootsplit')
.service('CashService', function(){
  /*
   * @input: Associative array of {cointype: amount} such as {gp: 10, sp: 50}
   * @output: Decimal equivalence
   */
  this.coinsToDecimal = function(coins){
    var total = 0;
    if(coins.cp) total += Number(coins.cp) * 0.01;
    if(coins.sp) total += Number(coins.sp) * 0.1;
    if(coins.ep) total += Number(coins.ep) * 0.5;
    if(coins.gp) total += Number(coins.gp);
    if(coins.pp) total += Number(coins.pp) * 10;
    return Number(total.toFixed(2));
  };

  /*
   * @input: Decimal up to two places
   * @output: Coin array
   */
  this.decimalToCoins = function(total, options){
    var coins = {};
    total = Number(total);

    if(options.allowPP){
      coins.pp = Math.floor(total/10);
      total = total - (coins.pp * 10);
    }

    coins.gp = Math.floor(total);
    total = total - coins.gp;

    if(options.allowEP){
      coins.ep = Math.floor(total/0.5);
      total = total - (coins.ep * 0.5);
    }

    coins.sp = Math.floor(total/0.1);
    total = total - (coins.sp * 0.1);

    coins.cp = Math.floor(total/0.01);
    total = total - (coins.cp * 0.01);

    return coins;
  };
})
.service('LootService', function($rootScope){
  var self = this;

  this.lootPile = [];
  this.characters = {};

  this.lootTotal = 0;
  this.characterTotals = {};

  this.sumLootPile = function(){
    var total = this.lootPile.reduce(function(runningTotal, item){
      return runningTotal += item.value;
    }, 0);
    return total;
  };

  this.slugify = function(text){
    return _.snakeCase(text);
  };

  this.getCharacter = function(name){
    return this.characters[this.slugify(name)];
  };

  this.removeCharacter = function(name){
    var charLoot = this.characters[this.slugify(name)].loot;
    this.lootPile.push(charLoot);
    delete this.characters[this.slugify(name)];
  };

  this.sumCharacter = function(name){
    var char = this.getCharacter(name);
    var charTotal = char.loot.reduce(function(runningTotal, item){
      return runningTotal += item.value;
    }, 0);
    return charTotal;
  };

  this.sumAllCharacters = function(){
    var characterLoot = _.toArray(this.characters).reduce(function(loot, char){
      return loot.concat(char.loot);
    }, []);

    var totalCharacterLootValue = characterLoot.reduce(function(runningTotal, item){
      return runningTotal += item.value;
    }, 0);

    return totalCharacterLootValue;
  };

  this.addCharacter = function(character){
    var name = this.slugify(character.name);
    if(!name || this.characters[name]) return false;
    this.characters[name] = character;
    return true;
  };

  this.getLootItem = function(id){
    for(var i = 0; i < this.lootPile.length; i++){
      var loot = this.lootPile[i];
      if(loot.id === id) return loot;
    }
  };

  this.removeLootItem = function(id){
    for(var i = 0; i < this.lootPile.length; i++){
      var loot = this.lootPile[i];
      if(loot.id === id) delete this.lootPile[i];
    }
  };

  this.updateLootTotal = function(){
    self.lootTotal = self.sumLootPile();
  };

  this.updateCharacterTotals = function(){
    for(var char in self.characters){
      var character = self.characters[char];
      self.characterTotals[char] = self.sumCharacter(char);
    }
  };

})
.service('NavService', function($rootScope){
  var self = this;
  this.routes = [
    {path: 'characters', name: 'Characters', active: false},
    {path: 'loot', name: 'Loot', active: false},
    {path: 'split', name: 'Split', active: false},
    {path: 'share', name: 'Share', active: false},
  ];

  $rootScope.$on('$locationChangeSuccess', function(e, newUrl){
    self.routes.forEach(function(route){
      if(newUrl.indexOf(route) !== -1) route.active = true;
    });
  });
});