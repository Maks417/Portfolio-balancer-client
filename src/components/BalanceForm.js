import React, { Component } from 'react';
import { Alert, Col, Row, Form, FormGroup, Button, Label, Input, FormFeedback } from 'reactstrap';
import axios from 'axios';

const currencyOptions = [
  { value: 'rub', text: '₽' },
  { value: 'usd', text: '$' },
  { value: 'eur', text: '€' }
];

export class BalanceForm extends Component {
  constructor(props) {
    super(props);

    this.validateRatio = this.validateRatio.bind(this);
    this.handleValues = this.handleValues.bind(this);
    this.addValueField = this.addValueField.bind(this);
    this.removeValueField = this.removeValueField.bind(this);
    this.changeContribution = this.changeContribution.bind(this);
    this.submitData = this.submitData.bind(this);

    this.state = {
      ratioValidClass: '',
      ratio: '',
      stocksValues: [{ value: '', currency: currencyOptions[0].value }],
      bondsValues: [{ value: '', currency: currencyOptions[0].value }],
      contributionAmount: { value: 0, currency: currencyOptions[0].value},
      submitDisabled: false,
      resultBox: {
        showResult: false,
        resultBoxClass: 'success',
        text: ''
      }
    };
  }

  validateRatio(e) {
    let validClass = e.target.value === '100' ? 'is-valid' : 'is-invalid';

    if(e.target.value.length > 3 && e.target.value.length < 6){
      const arr = e.target.value.split('/')
      validClass = arr.length === 2 && arr.reduce((prev, curr) => (Number(prev) || 0) + (Number(curr) || 0)) === 100 ? "is-valid" : "is-invalid"
    }

    this.setState({
      ratioValidClass: validClass,
      ratio: e.target.value
    });
  }

  addValueField(e, name, valuesArr){
    e.stopPropagation();
    
    this.setState(({
      [name]: [...valuesArr, { value: '', currency: currencyOptions[0].value }]
    }));
  }

  removeValueField(i, valuesArr){
    let values = valuesArr;
    values.splice(i, 1);
    this.setState({ values });
  }

  handleValues(i, e, valuesArr) {
    let values = valuesArr;

    if(e.target.type === 'number'){
      values[i].value = e.target.value;
    } else {
      values[i].currency = e.target.value;
    }

    this.setState({ values });
  }

  changeContribution(e) {
    this.setState({
      contributionAmount: { value: e.target.value, currency: currencyOptions[0].value },
    });
  }

  submitData(e){
    e.preventDefault();

    this.setState({ submitDisabled: true })

    const data = {
      ratio: this.state.ratio,
      stockValues: this.state.stocksValues,
      bondValues: this.state.bondsValues,
      ContributionAmount: this.state.contributionAmount
    }

    axios.post(
        'https://portfoliobalancerserver.azurewebsites.net/api/portfolio/calculate', 
        data, 
        { 'Content-Type': 'application/json' }
      )
      .then((response) => {
        this.setState({
          resultBox: {
            showResult: true,
            resultBoxClass: 'success',
            text: `Купить акций на: ${JSON.stringify(response.data.stocksDiff)}. Купить облигаций на:  ${JSON.stringify(response.data.bondsDiff)}`
          }
        })
      })
      .catch((error) => {
        if(error.response && error.response.status === 400) {
          this.setState({
            resultBox: {
              showResult: true,
              resultBoxClass: 'danger',
              text: JSON.stringify(error.response.data.errors ?? error.response.data)
            }
          })
        } else {
          console.log(error.response ?? error)
        }
      })
      .finally(() => {
        this.setState({ submitDisabled: false })
      });
  }

  render() {
    return (
      <div className='col-md-6 col-md-offset-3'>
        <Form className="portfolio-balancer-form" onSubmit={this.submitData}>
          <Row>
            <Col sm="12">
              <FormGroup className='form-group'>
                <Label for="ratio">Пропорция портфеля (акции/облигации, %)</Label>
                <Input required className={this.state.ratioValidClass} type="text" name="ratio" id="ratio" placeholder="e.g. 70/30" onChange={this.validateRatio} />
                <FormFeedback>Значение пропорции должно быть целое (100) или дробное (например, 50/50)</FormFeedback>
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col sm="12" md="6">
              <FormGroup className="form-group stocks-group">
                <Label for="stockValue">Добавьте стоимость каждой позиции в акциях</Label>
                {this.state.stocksValues.map((element, index) => (
                  <div className='row justify-content-center' key={index}>
                    {
                      index ? 
                      <Button className="number-field minus col-1" 
                        onClick={() => this.removeValueField(index, this.state.stocksValues)}>
                          <i className="fa fa-minus"></i>
                      </Button> 
                      : null
                    }
                    <Input className={index ? 'col-7 number-field' : 'offset-1 col-7 number-field'} type="number" name={`stockValue_value_${index}`} value={element.value} onChange={e => this.handleValues(index, e, this.state.stocksValues)} />
                    <Input disabled className="col-3 number-field" type="select" name={`stockValue_currency_${index}`} value={element.currency} onChange={e => this.handleValues(index, e, this.state.stocksValues)}>
                      {currencyOptions.map((item, i) => (
                        <option key={i} value={item.value}>{item.text}</option>
                      ))}
                    </Input>
                  </div>
                ))}
                <Button className="number-field plus"
                  onClick={e => this.addValueField(e, 'stocksValues', this.state.stocksValues)}>
                    <i className="fa fa-plus"></i>
                </Button>
              </FormGroup>
            </Col>
            <Col sm="12" md="6">
              <FormGroup className="form-group bonds-group">
                  <Label for="bondValue">Добавьте стоимость каждой позиции в облигациях</Label>
                  {this.state.bondsValues.map((element, index) => (
                    <div className='row justify-content-center' key={index}>
                      {
                        index ? 
                        <Button className="number-field minus col-1" 
                          onClick={() => this.removeValueField(index, this.state.bondsValues)}>
                            <i className="fa fa-minus"></i>
                        </Button> 
                        : null
                      }
                      <Input className={index ? 'col-7 number-field' : 'offset-1 col-7 number-field'} type="number" name={`bondValue_value_${index}`} value={element.value} onChange={e => this.handleValues(index, e, this.state.bondsValues)} />
                      <Input disabled className="col-3 number-field" type="select" name={`bondValue_currency_${index}`} value={element.currency} onChange={e => this.handleValues(index, e, this.state.bondsValues)}>
                        {currencyOptions.map((item, i) => (
                          <option key={i} value={item.value}>{item.text}</option>
                        ))}
                      </Input>
                    </div>
                  ))}
                  <Button className="number-field plus" 
                    onClick={e => this.addValueField(e, 'bondsValues', this.state.bondsValues)}>
                      <i className="fa fa-plus"></i>
                  </Button>
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col sm="12">
              <FormGroup className='form-group'>
                <Label for="contributionAmount">Сумма, которую хотите внести</Label>
                <div className='row justify-content-center'>
                  <Input required className='offset-1 number-field' type="number" name="contributionAmount" id="contributionAmount" onChange={this.changeContribution}/>
                  <Input disabled className="col-2 number-field" type="select" name={'contributionAmount_currency'} value={this.state.contributionAmount.currency}>
                        {currencyOptions.map((item, i) => (
                          <option key={i} value={item.value}>{item.text}</option>
                        ))}
                  </Input>
                </div>
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col className='text-center'>
              <Button color="primary" type="submit" disabled={this.state.submitDisabled}>Рассчитать</Button>
            </Col>
          </Row>
        </Form>

        <div className='col-10 offset-1'>
          {
            this.state.resultBox.showResult ?
            <Alert show={this.state.resultBox.showResult.toString()} variant={this.state.resultBox.resultBoxClass}>
                {this.state.resultBox.text}
            </Alert>
            : null
          }
        </div>
      </div>
    );
  }
}