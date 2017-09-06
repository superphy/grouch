import React, { PureComponent } from 'react';
// react-md
import FileInput from 'react-md/lib/FileInputs';
import TextField from 'react-md/lib/TextFields';
import Button from 'react-md/lib/Buttons';
import Subheader from 'react-md/lib/Subheaders';
import CircularProgress from 'react-md/lib/Progress/CircularProgress';
// redux
import { connect } from 'react-redux'
import { addJob } from '../actions'
import { subtypingDescription } from '../middleware/subtyping'
import { panseqDescription } from '../middleware/panseq'

// axios
import axios from 'axios'
import { API_ROOT } from '../middleware/api'
// router
import { Redirect } from 'react-router'
import Loading from '../components/Loading'

class Panseq extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      file: null,
      pi: 90,
      submitted: false,
      open: false,
      pan: true,
      msg: '',
      jobId: "",
      hasResult: false,
      progress: 0
    }
  }
  _selectFile = (file) => {
    console.log(file)
    if (!file) { return; }
    this.setState({ file });
  }

  _updateUploadProgress = ( progress ) => {
    this.setState({progress})
  }
  _handleSubmit = (e) => {
    e.preventDefault() // disable default HTML form behavior
    // open and msg are for Snackbar
    // uploading is to notify users
    this.setState({
      uploading: true
    });
    // configure a progress for axios
    const createConfig = (_updateUploadProgress) => {
      var config = {
        onUploadProgress: function(progressEvent) {
          var percentCompleted = Math.round( (progressEvent.loaded * 100) / progressEvent.total );
          _updateUploadProgress(percentCompleted)
        }
      }
      return config
    }
    // create form data with files```
    var data = new FormData()
    // eslint-disable-next-line
    this.state.file.map((f) => {
      data.append('file', f)
    })
    // append options
    // to match spfy(angular)'s format, we dont use a dict
    data.append('options.pi', this.state.pi)



    // POST
    axios.post(API_ROOT + 'panseq', data, createConfig(this._updateUploadProgress))
      .then(response => {
        console.log(response)
        // no longer uploading
        this.setState({
          uploading: false
        })
        let jobs = response.data
        // handle the return
        for(let job in jobs){
          // console.log(job)
          // console.log(jobs[job].analysis)
          // check filename
          let f = (this.state.file.length > 1 ?
          String(this.state.file.length + ' Files')
          :this.state.file[0].name)



            // regular subtyping uplods
            if(jobs[jobs].analysis === "panseq"){
              this.props.dispatch(addJob(job,
              'panseq',
              new Date().toLocaleTimeString(),
              panseqDescription(f, this.state.pi, this.state.pan)
              ))
              }

        }
        const hasResult = true
        this.setState({hasResult})
      })
  };
  render(){
    const { file, pi, amr, serotype, vf, groupresults, bulk, uploading, hasResult, progress } = this.state
    return (
      <div>
        {/* uploading bar */}
        {(uploading && !hasResult) ?
          <div>
            <CircularProgress key="progress" id="loading" value={progress} centered={false} />
            Uploading... {progress} %
          </div>
          : ""
        }
        {/* actual form */}
        {(!hasResult && !uploading)?
          <form className="md-text-container md-grid">
            <div className="md-cell md-cell--12">
              <FileInput
                id="inputFile"
                secondary
                label="Select File(s)"
                onChange={this._selectFile}
                multiple
              />


              <Button
                raised
                secondary
                type="submit"
                label="Submit"
                disabled={!file}
                onClick={this._handleSubmit}
              />
            </div>
            <div className="md-cell md-cell--12">
              {this.state.file ? this.state.file.map(f => (
                <TextField
                  key={f.name}
                  defaultValue={f.name}
                />
              )) : ''}
            </div>
          </form> :
          // if results are grouped, display the Loading page
          // else, results are separate and display the JobsList cards page
          (!uploading?(!groupresults?
            <Redirect to='/results' />:
            <Loading jobId={this.state.jobId} />
          ):"")

        }
      </div>
    )
  }
}

Panseq = connect()(Panseq)

export default Panseq