
import React from "react";

// reactstrap components
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  FormGroup,
  Form,
  Input,
  Container,
  Row,
  Col
} from "reactstrap";
// core components
import SearchUserHeader from "components/Headers/SearchUserHeader.js";
import { toast } from 'react-toastify';
import Loader from 'react-loader-spinner'
import { handleServerErrors } from "utils/errorHandler";
import RestAPI from '../services/api';
import ReactApexChart from 'react-apexcharts';


const SimilarityComponent = props => {
  if (props.showLoader) {
    return (
        <div className="text-center" style={{ padding: '20px' }}>
          <Loader type="Puff" color="#00BFFF" height={100} width={100} />
        </div>
      );
  } else {
    if (props.score) {
      return (
          <div>
            <h3 className="rounded-circle" style={{
            color: 'rgb(94, 114, 228)', textAlign: 'center', marginTop: '15px',
            fontSize: '45px'}}>{props.score} %</h3>

            <div id="chart">
              <ReactApexChart options={props.radarChartData.options} series={props.radarChartData.series} type="radar" height={300} />
            </div>
            
          </div>
        );
    } else {
      return <Button onClick={props.getScore} style={{ marginTop: '30px' }} color="primary">Get Similarity Score</Button>;
    }
  }  
} 

class SearchUserProfile extends React.Component {
  state = {
    data: [],
    id: '',
    email: '',
    first_name: '',
    last_name: '',
    twitter_account_id: '',
    author_id: '',
    paper_count: '',
    tweet_count: '',
    keyword_count: '',
    score: '',
    isLoding: false,
    isLoding1: false,
    radarChartData: {}
  }
  componentDidMount() {
    this.setState({ isLoding: true }, () => {
      RestAPI.getUserProfile(this.props.match.params.id).then(response => {
        this.setState({
          isLoding: false,
          id: response.data.id,
          first_name: response.data.first_name,
          email: response.data.email,
          last_name: response.data.last_name,
          twitter_account_id: response.data.twitter_account_id,
          author_id: response.data.author_id,
          paper_count: response.data.paper_count,
          tweet_count: response.data.tweet_count,
          keyword_count: response.data.keyword_count
        })

      }).catch(error => {
        this.setState({ isLoding: false })
        handleServerErrors(error, toast.error)


      })
    })
  };

  componentDidUpdate(prevPro) {

    if (prevPro.match.params.id !== this.props.match.params.id) {
      this.setState({ isLoding: true }, () => {
        RestAPI.getUserProfile(this.props.match.params.id).then(response => {
          this.setState({
            isLoding: false,
            id: response.data.id,
            first_name: response.data.first_name,
            email: response.data.email,
            last_name: response.data.last_name,
            twitter_account_id: response.data.twitter_account_id,
            author_id: response.data.author_id,
            paper_count: response.data.paper_count,
            tweet_count: response.data.tweet_count,
            keyword_count: response.data.keyword_count,
            score: '',
            radarChartData: {}
          })

        }).catch(error => {
          this.setState({ isLoding: false })
          handleServerErrors(error, toast.error)


        })
      })
    }
  }

  handleChange = e => {
    let getValue = e.target.value;
    let getName = e.target.name;
    this.setState(() => ({ [getName]: getValue }))
  };

  _handleSubmit = (e) => {
    const { id, email, first_name, last_name, twitter_account_id, author_id } = this.state
    e.preventDefault();
    let data = {
      email: email,
      first_name: first_name,
      last_name: last_name,
      twitter_account_id: twitter_account_id,
      author_id: author_id,
    };

    this.setState({ isLoding: true }, () => {
      RestAPI.updateUserProfile(data, id).then(response => {
        toast.success("Update Profile Data !", {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 2000
        });
        this.setState({ isLoding: false, })
        // this.props.history.push("/admin/view-paper");

      }).catch(error => {
        this.setState({ isLoding: false })
        handleServerErrors(error, toast.error)

      })
    })

  };

  getScore = () => {
    this.setState({ isLoding1: true }, () => {
      RestAPI.getScore(this.props.match.params.id).then(response => {
        const radarChartData = {
            series: [{
              name: 'Your Interests',
              data: Object.values(response.data.user_1_data || {}),
            }, {
              name: "User's Interests",
              data: Object.values(response.data.user_2_data || {}),
            }],
            options: {
              chart: {
                toolbar: {show:false},
                height: 350,
                type: 'radar',
                dropShadow: {
                  enabled: true,
                  blur: 1,
                  left: 1,
                  top: 1
                }
              },
              stroke: {
                width: 2
              },
              fill: {
                opacity: 0.1
              },
              markers: {
                size: 0
              },
              xaxis: {
                categories: Object.keys(response.data.user_1_data || {})
              }
            },
          
          
          };
        this.setState({ isLoding1: false, score: response.data.score, radarChartData })
        // this.props.history.push("/admin/view-paper");

      }).catch(error => {
        console.log(error)
        this.setState({ isLoding1: false })
        handleServerErrors(error, toast.error)

      })
    })

  }

  render() {
    const { email, first_name, last_name, twitter_account_id, author_id, paper_count, tweet_count, keyword_count } = this.state
    return (
      <>
        <SearchUserHeader />
        {/* Page content */}


        <Container className="mt--7" fluid>

          <Row>
            <Col className="order-xl-2 mb-5 mb-xl-0" xl="4">
              <Card className="card-profile shadow">
                <Row className="justify-content-center">
                  <Col className="order-lg-2" lg="12">
                    <div className="card-profile-image" style={{ textAlign: 'center' }}>
                      <SimilarityComponent radarChartData={this.state.radarChartData} score={this.state.score} showLoader={this.state.isLoding1} getScore={this.getScore} />
                    </div>
                  </Col>
                </Row>
                <CardBody className="pt-0 pt-md-4">
                  <Row>
                    <div className="col">
                      <div className="card-profile-stats d-flex justify-content-center " style={{ marginTop: '0px !important' }}>
                        <div>
                          <span className="heading">{this.state.data && paper_count}</span>
                          <span className="description">Papers</span>
                        </div>

                        {/* <div>
                          <span className="heading">{this.state.data && keyword_count}</span>
                          <span className="description">Keywords</span>
                        </div> */}
                        <div>
                          <span className="heading">{this.state.data && tweet_count}</span>
                          <span className="description">Tweet Count</span>
                        </div>
                      </div>
                    </div>
                  </Row>
                  <div className="text-center">
                    <h3>
                      {this.state.data && first_name + ' ' + last_name}
                    </h3>
                    <hr className="my-4" />
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col className="order-xl-1" xl="8">
              <Card className="bg-secondary shadow">
                <CardHeader className="bg-white border-0">
                  <Row className="align-items-center">
                    <Col xs="8">
                      <h3 className="mb-0">User Account Detils</h3>
                    </Col>

                  </Row>
                </CardHeader>
                <CardBody>
                  {this.state.isLoding ?
                    (<div className="text-center" style={{ padding: '20px' }}>
                      <Loader type="Puff" color="#00BFFF" height={100} width={100} />
                    </div>)
                    :
                    <Form onSubmit={this._handleSubmit} method="post">
                      <h6 className="heading-small text-muted mb-4">
                        User information
                    </h6>
                      <div className="pl-lg-4">

                        <Row>
                          <Col lg="6">
                            <FormGroup>
                              <label
                                className="form-control-label"
                                htmlFor="input-first-name"
                              >
                                First name
                            </label>
                              <Input
                                className="form-control-alternative"
                                // defaultValue="Lucky"

                                id="input-first-name"
                                name="first_name" defaultValue={first_name} disabled
                                placeholder="First name"
                                type="text"
                              />
                            </FormGroup>
                          </Col>
                          <Col lg="6">
                            <FormGroup>
                              <label
                                className="form-control-label"
                                htmlFor="input-last-name"
                              >
                                Last name
                            </label>
                              <Input
                                className="form-control-alternative"
                                // defaultValue="Jesse"
                                id="input-last-name" disabled
                                name="last_name" defaultValue={last_name}
                                placeholder="Last name"
                                type="text"
                              />
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row>
                          <Col lg="6">
                            <FormGroup>
                              <label
                                className="form-control-label"
                                htmlFor="input-email"
                              >
                                Email address
                            </label>
                              <Input
                                className="form-control-alternative"
                                id="input-email"
                                name="email" defaultValue={email} disabled
                                placeholder="jesse@example.com"
                                type="email"
                              />
                            </FormGroup>
                          </Col>
                        </Row>
                      </div>
                      <hr className="my-4" />
                      {/* Address */}
                      <h6 className="heading-small text-muted mb-4">
                        Source information
                    </h6>
                      <div className="pl-lg-4">
                        <Row>
                        </Row>
                        <Row>
                          <Col lg="6">
                            <FormGroup>
                              <label
                                className="form-control-label"
                                htmlFor="input-city"
                              >
                                Author Id
                            </label>
                              <Input
                                className="form-control-alternative"
                                id="input-city"
                                name="author_id" defaultValue={author_id} disabled
                                placeholder="City"
                                type="text"
                              />
                            </FormGroup>
                          </Col>
                          <Col lg="6">
                            <FormGroup>
                              <label
                                className="form-control-label"
                                htmlFor="input-country"
                              >
                                Twitter Id
                            </label>
                              <Input
                                className="form-control-alternative"
                                id="input-country"

                                name="twitter_account_id" defaultValue={twitter_account_id} disabled
                                placeholder="Twitter Acount id"
                                type="text"
                              />
                            </FormGroup>
                          </Col>

                        </Row>
                      </div>
                      <hr className="my-4" />

                    </Form>
                  }
                </CardBody>
              </Card>
            </Col>
          </Row>

        </Container>
      </>
    );

  }
}

export default SearchUserProfile;
