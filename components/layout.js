import React from "react";
import Router from "next/router";
import Head from "next/head";
import Link from "next/link";
import Signup from "../pages/signup";
import Opinion from "../pages/opinion";
import Board from "../pages/board";
import { login } from "./userFunction";
import profile from "./profile";

import {
  Container,
  Row,
  Col,
  Nav,
  NavItem,
  Button,
  Form,
  NavLink,
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ListGroup,
  ListGroupItem
} from "reactstrap";
import Signin from "./signin";
import { NextAuth } from "next-auth/client";
import Cookies from "universal-cookie";
import Package from "../package";
import Styles from "../css/index.scss";

export default class extends React.Component {
  static propTypes() {
    return {
      session: React.PropTypes.object.isRequired,
      providers: React.PropTypes.object.isRequired,
      children: React.PropTypes.object.isRequired,
      fluid: React.PropTypes.boolean,
      navmenu: React.PropTypes.boolean,
      signinBtn: React.PropTypes.boolean
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      navOpen: false,
      modal: false,
      providers: null
    };
    this.toggleModal = this.toggleModal.bind(this);
  }

  async toggleModal(e) {
    if (e) e.preventDefault();

    // Save current URL so user is redirected back here after signing in
    if (this.state.modal !== true) {
      const cookies = new Cookies();
      cookies.set("redirect_url", window.location.pathname, { path: "/" });
    }

    this.setState({
      providers: this.state.providers || (await NextAuth.providers()),
      modal: !this.state.modal
    });
  }

  render() {
    return (
      <React.Fragment>
        <Head>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>{this.props.title || "Next.js Starter Project"}</title>
          <style dangerouslySetInnerHTML={{ __html: Styles }} />
          <script src="https://cdn.polyfill.io/v2/polyfill.min.js" />
        </Head>
        <Navbar light className="navbar navbar-expand-md pt-3 pb-3">
          <Link prefetch href="/">
            <NavbarBrand href="/">
              <span className="logo">
                <img src="static/img/logo.png" />
              </span>
            </NavbarBrand>
          </Link>
          <input
            className="nojs-navbar-check"
            id="nojs-navbar-check"
            type="checkbox"
            aria-label="Menu"
          />
          <label tabIndex="1" htmlFor="nojs-navbar-check" className="nojs-navbar-label mt-2" />
          <div className="nojs-navbar">
            <Nav navbar>
              <div tabIndex="1" className="dropdown nojs-dropdown">
                <div className="nav-item">
                  <span className="dropdo">
                    <a href="#">거래소</a>
                  </span>
                  <span className="dropdo">
                    <a href="#">입출금</a>
                  </span>
                  <span className="dropdo">
                    <a href="#">투자내역</a>
                  </span>
                  <span className="dropdo">
                    <a href="#">고객센터</a>
                  </span>
                </div>
              </div>
            </Nav>
            <UserMenu
              session={this.props.session}
              toggleModal={this.toggleModal}
              signinBtn={this.props.signinBtn}
            />
          </div>
        </Navbar>
        <MainBody
          navmenu={this.props.navmenu}
          fluid={this.props.fluid}
          container={this.props.container}
        >
          {this.props.children}
        </MainBody>

        <SigninModal
          modal={this.state.modal}
          toggleModal={this.toggleModal}
          session={this.props.session}
          providers={this.state.providers}
        />
      </React.Fragment>
    );
  }
}

export class MainBody extends React.Component {
  render() {
    if (this.props.container === false) {
      return <React.Fragment>{this.props.children}</React.Fragment>;
    } else if (this.props.navmenu === false) {
      return (
        <Container fluid={this.props.fluid} style={{ marginTop: "1em" }}>
          {this.props.children}
        </Container>
      );
    } else {
      return (
        <Container fluid={this.props.fluid} style={{ marginTop: "1em" }}>
          <Row>
            <Col xs="12" md="9" lg="10">
              {this.props.children}
            </Col>
          </Row>
        </Container>
      );
    }
  }
}

export class UserMenu extends React.Component {
  constructor(props) {
    super(props);
    this.handleSignoutSubmit = this.handleSignoutSubmit.bind(this);
  }

  async handleSignoutSubmit(event) {
    event.preventDefault();

    // Save current URL so user is redirected back here after signing out
    const cookies = new Cookies();
    cookies.set("redirect_url", window.location.pathname, { path: "/" });

    await NextAuth.signout();
    Router.push("/");
  }

  render() {
    if (this.props.session && this.props.session.user) {
      // If signed in display user dropdown menu
      const session = this.props.session;
      return (
        <Nav className="ml-auto" navbar>
          {/*<!-- Uses .nojs-dropdown CSS to for a dropdown that works without client side JavaScript ->*/}
          <div tabIndex="2" className="dropdown nojs-dropdown">
            <div className="nav-item">
              <span className="dropdown-toggle nav-link d-none d-md-block">
                <span
                  className="icon ion-md-contact"
                  style={{ fontSize: "2em", position: "absolute", top: -5, left: -25 }}
                />
              </span>
              <span className="dropdown-toggle nav-link d-block d-md-none">
                <span className="icon ion-md-contact mr-2" />
                {session.user.name || session.user.email}
              </span>
            </div>
            <div className="dropdown-menu">
              <Link prefetch href="/account">
                <a href="/account" className="dropdown-item">
                  <span className="icon ion-md-person mr-1" /> Your Account
                </a>
              </Link>
              <AdminMenuItem {...this.props} />
              <div className="dropdown-divider d-none d-md-block" />
              <div className="dropdown-item p-0">
                <Form
                  id="signout"
                  method="post"
                  action="/auth/signout"
                  onSubmit={this.handleSignoutSubmit}
                >
                  <input name="_csrf" type="hidden" value={this.props.session.csrfToken} />
                  <Button type="submit" block className="pl-4 rounded-0 text-left dropdown-item">
                    <span className="icon ion-md-log-out mr-1" /> Sign out
                  </Button>
                </Form>
              </div>
            </div>
          </div>
        </Nav>
      );
    }
    if (this.props.signinBtn === false) {
      // If not signed in, don't display sign in button if disabled
      return null;
    } else {
      // If not signed in, display sign in button
      return (
        <Nav className="ml-auto" navbar>
          <NavItem>
            {/**
             * @TODO Add support for passing current URL path as redirect URL
             * so that users without JavaScript are also redirected to the page
             * they were on before they signed in.
             **/}
            <span className="bar">|</span>
            <a href="../newboard" className="board_1">
              <span className="board"> BOARD</span>
            </a>

            <a href="/auth?redirect=/" className="board_1" onClick={this.props.toggleModal}>
              <span className="login" /> LOGIN
            </a>

            <a href="#" className="board_2">
              <img src="static/img/search.png" />
            </a>
          </NavItem>
        </Nav>
      );
    }
  }
}

export class AdminMenuItem extends React.Component {
  render() {
    if (this.props.session.user && this.props.session.user.admin === true) {
      return (
        <React.Fragment>
          <Link prefetch href="/admin">
            <a href="/admin" className="dropdown-item">
              <span className="icon ion-md-settings mr-1" /> Admin
            </a>
          </Link>
        </React.Fragment>
      );
    } else {
      return <div />;
    }
  }
}

export class SigninModal extends React.Component {
  constructor() {
    super();
    this.state = {
      email: "",
      password: ""
    };

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }
  onChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }
  onSubmit(e) {
    e.preventDefault();

    const user = {
      email: this.state.email,
      password: this.state.password
    };

    login(user)
      .then(res => {})
      .catch(err => {
        console.log(err);
      });
  }

  render() {
    if (this.props.providers === null) return null;

    return (
      <Modal isOpen={this.props.modal} toggle={this.props.toggleModal} style={{ maxWidth: 773 }}>
        <ModalBody className="ModalBody">
          <div id="logi">
            <img className="logimg" src="static/img/sixweekslogin.png" />
            <p className="logcheck">로그인하는 사이트의 주소가 아래와 같은지 확인하세요</p>
            <p className="site">
              <img src="static/img/lock.png" />
              https://www.SIXWEEKS.com
            </p>
            <form onSubmit={this.onSubmit}>
              <div id="formm" className="form-group row">
                <label htmlFor="inputEmail3" className="col-sm-2 col-form-label" />
                <div className="col-sm-10">
                  <input
                    type="email"
                    className="form-control"
                    id="inputEmail3"
                    placeholder="이메일"
                    name="email"
                    value={this.state.email}
                    onChange={this.onChange}
                  />
                </div>
              </div>
              <div id="formm" className="form-group row">
                <label htmlFor="inputPassword3" className="col-sm-2 col-form-label" />
                <div className="col-sm-10">
                  <input
                    type="password"
                    className="form-control"
                    id="inputPassword3"
                    placeholder="비밀번호"
                    name="password"
                    value={this.state.password}
                    onChange={this.onChange}
                  />
                </div>
              </div>
              <div className="col-auto my-1">
                <div className="custom-control custom-checkbox mr-sm-2">
                  <input
                    type="checkbox"
                    className="custom-control-input"
                    id="customControlAutosizing"
                  />
                  <label
                    className="custom-control-label"
                    htmlFor="customControlAutosizing"
                    id="memory"
                  >
                    비밀번호저장
                  </label>
                  <span className="findid">
                    <a href="#">아이디 / 비밀번호 찾기</a>
                  </span>
                </div>
              </div>
              <Button className="lobtn" color="primary">
                Login
              </Button>{" "}
              <Button className="lobtn1" outline color="secondary" href="../signup">
                Sign up
              </Button>{" "}
            </form>
            <button type="button" className="naver-btn">
              <img src="static/img/naver-img.png" />
              NAVER 로그인
            </button>
            <button type="button" className="google-btn">
              <img src="static/img/google-img.png" />
              GOOGLE 로그인
            </button>
          </div>
        </ModalBody>
      </Modal>
    );
  }
}
