import React, { useEffect, useState, useRef } from "react";
import "antd/dist/antd.css";
import {
  Row,
  Col,
  Form,
  Input,
  Button,
  Upload,
  message,
  List,
  Typography,
} from "antd";
import axios from "axios";
import { UploadOutlined } from "@ant-design/icons";
import JoditEditor from "jodit-react";

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};

function App() {
  const editor = useRef(null);
  const subject = useRef(null);
  const [emails, setEmails] = useState();
  const [repeatedRequest, setRepeatedRequest] = useState(false);

  function submit() {
    axios.post("/submit", {
      subject: subject.current.state.value,
      body: editor.current.value,
    }).then(() => {
      message.success("Email send");
    }).catch(()=> {
      message.error("error");
    });
  }

  useEffect(() => {
    var interval;
    if (repeatedRequest) {
      interval = setInterval(() => {
        axios.get("/getEmails").then((res) => {
          setEmails(res.data);
          setRepeatedRequest(false);
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [repeatedRequest]);

  const props = {
    name: "file",
    action: "/upload",

    onChange(info) {
      setRepeatedRequest(true);
      if (info.file.status === "done") {
        message.success(`${info.file.name} file uploaded successfully`);
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };

function login(data){
  axios.post("/login",{
    user: data.username,
    pswd: data.password
  }).then(res => {
    localStorage.setItem("user",{username: data.username,password:data.password})
  })
}

  return (
    <>
      <div className="navbar">
        <h2>Send Emaill</h2>
      </div>

      <div className="main">
        <Row gutter={[8, 8]}>
          <Col span={10}>
            <h1>Enter your email user and password</h1>
            <Form {...layout} name="basic" onFinish={login} initialValues={{ remember: true }}>
              <Form.Item
                label="Username"
                name="username"
                rules={[
                  { required: true, message: "Please input your username!" },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[
                  { required: true, message: "Please input your password!" },
                ]}
              >
                <Input.Password />
              </Form.Item>

              <Form.Item {...tailLayout}>
                <Button type="primary" htmlType="submit">
                  Submit
                </Button>
              </Form.Item>
            </Form>
          </Col>
          <Col span={14}>
            <Upload {...props}>
              <Button icon={<UploadOutlined />}>Click to Upload</Button>
            </Upload>
            <br />
            <br />

            {emails && (
              <List
                header={<div>Emails</div>}
                bordered
                dataSource={emails}
                renderItem={(item) => <List.Item>{item[0]}</List.Item>}
              />
            )}

            <div className="email">
              <form action="/submit" method="post">
                <Input placeholder="Basic usage" ref={subject} />
                <JoditEditor
                  ref={editor}
                  tabIndex={1} // tabIndex of textarea
                  name="body"
                />
                <Button onClick={submit} icon={<UploadOutlined />}>
                  Send Email
                </Button>
              </form>
            </div>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default App;
