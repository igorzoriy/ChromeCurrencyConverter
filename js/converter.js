/**
 * @author Igor Zoriy
 * @date 19.02.12
 *
 */

var converter =
{
  currencyList: [],
  url: 'http://www.cbr.ru/scripts/XML_daily.asp'
};

converter.init = function()
{
  converter.currencyList['RUR'] =
  {
    code: 'RUR',
    name: chrome.i18n.getMessage('RUR'),
    course: 1
  };

  // show preloader
  document.getElementById('preloader').style.display = 'block';

  // get currency list
  var request = new XMLHttpRequest();
  request.open('GET', converter.url);
  request.send('');
  request.onreadystatechange = function()
  {
    if(request.readyState != 4) return;

    if(request.status != 200)
    {
      converter.showError(chrome.i18n.getMessage('loadError'));
    }
    else
    {
      var valuteList = request.responseXML.getElementsByTagName('Valute');
      var i, j;
      // fill currencyList
      for (i = 0; i < valuteList.length; i++)
      {
        var code, value, nominal;
        for(j = 0; j < valuteList[i].childNodes.length; j++)
        {
          var node = valuteList[i].childNodes[j];
          if(node.nodeName == "CharCode") code = node.textContent;
          if(node.nodeName == "Value") value = node.textContent;
          if(node.nodeName == "Nominal") nominal = node.textContent;
        }
        var course = parseFloat(value.split(",").join(".")) / parseFloat(nominal);
        converter.currencyList[code] = {code:code, course:course};
      }

      converter.fillCurrencySelectors();

      // set selected option fot toCurrency
      var toCurrencyOptions = document.getElementById('secondCurrency').options;
      for(i = 0; i < toCurrencyOptions.length; i++)
      {
        if(toCurrencyOptions[i].value == 'USD') toCurrencyOptions.selectedIndex = i;
      }

      // bind calculate event
      var calculateList = document.getElementsByClassName('calculate');
      for (i = 0; i < calculateList.length; i++)
      {
        var element = calculateList[i];
        if(element.tagName == 'INPUT') element.addEventListener('keyup', converter.calculate, false);
        else if(element.tagName == 'SELECT') element.addEventListener('change', converter.calculate, false);
      }

      // remove readonly
      var readonlyList = document.getElementsByClassName('readonly');
      for (i = 0; i < readonlyList.length; i++)
      {
        readonlyList[i].removeAttribute('readonly');
      }
    }
    // hide preloader
    document.getElementById('preloader').style.display = 'none';
  }
}

converter.fillCurrencySelectors = function()
{
  var selectorList = document.getElementsByClassName('currencySelect');
  for (var i = 0; i < selectorList.length; i++)
  {
    for(var key in converter.currencyList)
    {
      var currency = converter.currencyList[key];
      var option = new Option(chrome.i18n.getMessage(currency.code), currency.code);
      selectorList[i].options.add(option);
    }
  }
}

converter.showError = function(message)
{
  var element = document.getElementById('errorMessage');
  element.textContent = message;
  element.style.display = 'block';
}

converter.calculate = function()
{
  var inValue, outValue, inCurrency, outCurrency;
  if(this.id == 'secondValue')   // calculate rule
  {
    inValue = 'secondValue';
    outValue = 'firstValue';
    inCurrency = 'secondCurrency';
    outCurrency = 'firstCurrency';
  }
  else
  {
    inValue = 'firstValue';
    outValue = 'secondValue';
    inCurrency = 'firstCurrency';
    outCurrency = 'secondCurrency';
  }

  inValue = document.getElementById(inValue).value;
  if (inValue == '') // empty input value
  {
    document.getElementById(outValue).value = '';
    return;
  }

  var inCourse = converter.currencyList[document.getElementById(inCurrency).value].course;
  var outCource = converter.currencyList[document.getElementById(outCurrency).value].course;

  // calclate output value
  var value = parseFloat(inValue) * (inCourse / outCource);
  value = value.toFixed(2);
  document.getElementById(outValue).value = value;
}

window.onload = converter.init;