import React, { Fragment, useState } from 'react';
import Message from './Message';
import Progress from './Progress';
import axios from 'axios';
import { config } from 'dotenv';
import download from 'downloadjs'
import '../App.css'
const FileUpload = () => {
  const [file, setFile] = useState('');
  const [filename, setFilename] = useState('Choose File');
  const [uploadedFile, setUploadedFile] = useState({});
  const [message, setMessage] = useState('');
  const [uploadPercentage, setUploadPercentage] = useState(0);

  const onChange = e => {
    setFile(e.target.files[0]);
    setFilename(e.target.files[0].name);
  };

  const onSubmit = async e => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);
    const Token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MGJmMzM2YzRhZjMyMWQ0Yjg3NjNiY2IiLCJpYXQiOjE2MjMxNDY0NzF9.wKLl9CjJgQ7O8FOHIrX4Yu8iguyyvbHU7C6oEeeDiII'
    axios.interceptors.request.use(
        config => {
            config.headers.authorization = `Bearer ${Token}`;
            return config ;
        },
        error => {
            return Promise.reject(error)
        }
    )
    try {
      const res = await axios.post('http://localhost:3000/api/csv/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: progressEvent => {
          setUploadPercentage(
            parseInt(
              Math.round((progressEvent.loaded * 100) / progressEvent.total)
            )
          );
        }
      });
      
      // Clear percentage
      setTimeout(() => setUploadPercentage(0), 10000);

      const { fileName, filePath } = res.data;

      setUploadedFile({ fileName, filePath });

      setMessage('File Uploaded');
    } catch (err) {
      if (err.response.status === 500) {
        setMessage('There was a problem with the server');
      } else {
        setMessage(err.response.data.msg);
      }
      setUploadPercentage(0)
    }
  };
const onDownload = async e => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);
    const Token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MGJmMzM2YzRhZjMyMWQ0Yjg3NjNiY2IiLCJpYXQiOjE2MjMxNDY0NzF9.wKLl9CjJgQ7O8FOHIrX4Yu8iguyyvbHU7C6oEeeDiII'
    axios.interceptors.request.use(
        config => {
            config.headers.authorization = `Bearer ${Token}`;
            return config ;
        },
        error => {
            return Promise.reject(error)
        }
    )
    try {
      const result = await axios.get('http://localhost:3000/api/csv/Download', formData, {
        headers: {
          'Content-Type': 'blob',
        }
      });
      
      // Clear percentage


    return  download(result.data,filename)
    } catch (err) {
      if (err.response.status === 500) {
        setMessage('There was a problem with the server');
      } else {
        setMessage(err.response.data.msg);
      }
    }
  };

  return (
    <Fragment>
      {message ? <Message msg={message} /> : null}
      <form onSubmit={onSubmit}>
        <div className='custom-file mb-4'>
          <input
            type='file'
            className='custom-file-input'
            id='customFile'
            onChange={onChange}
          />
          <label className='custom-file-label' htmlFor='customFile'>
            {filename}
          </label>
        </div>

        <Progress percentage={uploadPercentage} />
        <input
          type='submit'
          value='Upload'
          className='btn btn-primary btn-block mt-4'
        />
        
      </form>
      <form onSubmit={onDownload} >
      <input
          type='submit'
          value='Dowload'
          className='btn btn-primary btn-block mt-4'
        />
        </form>
      {uploadedFile ? (
        <div className='row mt-5'>
          <div className='col-md-6 m-auto'>
            <h3 className='text-center'>{uploadedFile.fileName}</h3>
            <img style={{ width: '100%' }} src={uploadedFile.filePath} alt='' />
          </div>
        </div>
      ) : null}
    </Fragment>
  );
};

export default FileUpload;