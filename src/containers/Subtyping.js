import React, { Component } from 'react';
// react-md
import {
  FileInput,
  Checkbox,
  TextField,
  Button,
  Switch,
  Subheader,
  Divider,
  CircularProgress,
  Collapse,
} from 'react-md';
// redux
import { connect } from 'react-redux'
import { addJob } from '../actions'
import { subtypingDescription } from '../middleware/subtyping'
// import { phylotyperDescription } from '../middleware/phylotyper'
// axios
import axios from 'axios'
import { API_ROOT } from '../middleware/api'
// router
import { withRouter } from 'react-router';
import { Redirect } from 'react-router'
import Loading from '../components/Loading'
import { RedirectToken } from '../components/RedirectToken'
// redirects
import { RESULTS } from '../Routes'

class Subtyping extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: true,
      file: null,
      pi: 90,
      amr: false,
      serotype: true,
      vf: true,
      submitted: false,
      open: false,
      jobId: "",
      hasResult: false,
      groupresults: true,
      bulk: false,
      progress: 0,
      prob: 90,
      stx1: false,
      stx2: false,
      eae: false,
      pan: true
    }
  }
  toggle = () => {
    this.setState({ collapsed: !this.state.collapsed });
  };
  _selectFile = (file) => {
    console.log(file)
    if (!file) { return; }
    this.setState({ file });
  }
  _updatePi = (value) => {
    this.setState({ pi: value });
  }
  _updateSerotype = (value) => {
    this.setState({ serotype: value })
  }
  _updateAmr = (value) => {
    this.setState({ amr: value })
  }
  _updateVf = (value) => {
    // if (this.state.stx1 ||
    //   this.state.stx2 ||
    //   this.state.eae){
    //     // do nothing
    // } else {
      this.setState({ vf: value })
    // }
  }
  _updateStx1 = (value) => {
    this.setState({ stx1: value })
    // this.setState({ vf: true })
    // this.setState({groupresults: false})
  }
  _updateStx2 = (value) => {
    this.setState({ stx2: value })
    // this.setState({ vf: true })
    // this.setState({groupresults: false})
  }
  _updateEae = (value) => {
    this.setState({ eae: value })
    // this.setState({ vf: true })
    // this.setState({groupresults: false})
  }
  _updateProb = (value) => {
    this.setState({ prob: value })
  }
  _updateGroupResults = (groupresults) => {
    this.setState({ groupresults })
  }
  _updateBulk = (bulk) => {
    this.setState({ bulk })
    // if using bulk uploading, we use the `blob` id feature of superphy/backend
    // to poll for completion of all jobs
    if(bulk){
      this.setState({ groupresults:true })
    }
  }
  _updateUploadProgress = ( progress ) => {
    this.setState({progress})
  }
  _handleSubmit = (e) => {
    e.preventDefault() // disable default HTML form behavior
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
    // create form data with files
    var data = new FormData()
    // eslint-disable-next-line
    this.state.file.map((f) => {
      data.append('file', f)
    })
    // append options
    // to match spfy(angular)'s format, we dont use a dict
    data.append('options.pi', this.state.pi)
    data.append('options.amr', this.state.amr)
    data.append('options.serotype', this.state.serotype)
    data.append('options.vf', this.state.vf)
    data.append('options.stx1', this.state.stx1)
    data.append('options.stx2', this.state.stx2)
    data.append('options.eae', this.state.eae)
    // new option added in 4.2.0, group all files into a single result
    // this means polling in handled server-side
    data.append('options.groupresults', this.state.groupresults)
    // new option added in 4.3.3, use bulk uploading where results are only
    // stored and not returned (ie. don't run beautify.py on server-side)
    data.append('options.bulk', this.state.bulk)
    data.append('options.pan', this.state.pan)
    // POST
    axios.post(API_ROOT + 'upload', data, createConfig(this._updateUploadProgress))
      .then(response => {
        console.log("RESPONSE")
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

          // If the results are to be grouped and more than one file,
          // set the job filename to simply the number of files.
          let f = ''
          if ((this.state.file.length > 1) && (this.state.groupresults)){
            f = String(this.state.file.length + ' Files')
          } else {
            // Otherwise, retrieve the filename from the response.
            // let fullname = jobs[job].file
            // Need to strip the prefix spfy generates.
            f = this.state.file[0].name
          }

          // for bulk uploading
          if(this.state.bulk){
            const jobId = job
            this.setState({jobId})
            this.props.dispatch(addJob(job,
              "bulk",
              new Date().toLocaleString(),
              subtypingDescription(
                'Bulk Upload: ' + f , this.state.pi, this.state.serotype, this.state.vf, this.state.amr, this.state.pan)
            ))
          } else {
            // regular subtyping uploads
            // set the jobId state so we can use Loading
            const jobId = job
            this.setState({jobId})
            // dispatch
            this.props.dispatch(addJob(job,
              "Subtyping",
              new Date().toLocaleString(),
              subtypingDescription(
                f , this.state.pi, this.state.serotype, this.state.vf, this.state.amr, this.state.pan, this.state.prob, this.state.stx1, this.state.stx2, this.state.eae)
            ))
          }
        }
        const hasResult = true
        this.setState({hasResult})
      })
      // this is done just to trigger panseq to run in the background, doesn't
      // store the job in redux
      // axios.post(API_ROOT + 'panseq', data, createConfig(this._updateUploadProgress))
      // .then(response => {
      //   console.log('PANSEQ')
      //   console.log(response)
      // })
  };
  render(){
    const { file, pi, amr, serotype, vf, stx1, stx2, eae, prob, groupresults, bulk, uploading, hasResult, progress, collapsed } = this.state;
    const { token } = this.props;
    return (
      <div>
        <RedirectToken token={token} />
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
              <Button raised primary swapTheming label='Help' onClick={this.toggle}>
                help_outline
              </Button>
              <Collapse collapsed={collapsed}>
                <div>
                  <br />
                  <h6>Underlying Packages:</h6>
                  <p>
                    <li>
                      ECTyper: <a href='https://github.com/phac-nml/ecoli_serotyping/'>phac-nml/ecoli_serotyping</a>
                    </li>
                    <li>
                      RGI (CARD): <a href='https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5210516/'>doi: 10.1093/nar/gkw1004</a>
                    </li>
                    <li>
                      Phylotyper: <a href='https://www.ncbi.nlm.nih.gov/pubmed/29036291'>doi: 10.1093/bioinformatics/btx459</a>
                    </li>
                  </p>
                  <h6>Description:</h6>
                  <p>
                    This is the initial analysis step for Spfy. We use the
                    modules above to analyze submitted genome files
                    and create graph nodes for storage / downstream analysis
                    in the graph database.
                  </p>
                  <p>
                    Submit any E. coli genome files and the initial results
                    will be presented to you in tabular form.
                  </p>
                  <p>
                    To perform statistical comparisons on graph nodes in the
                    database, please use the 'statistical comparisons' feature
                    accesible via the home page.
                  </p>
                </div>
              </Collapse>
            </div>
            <div className="md-cell md-cell--12">
              <FileInput
                id="inputFile"
                secondary
                label="Select File(s)"
                onChange={this._selectFile}
                multiple
              />

            </div>
            <div className="md-cell md-cell--12">
              <h5>ECTyper Subtyping Analysis</h5>
              <Switch
                id="bulk"
                name="bulk"
                label="Side load for db: don't display results"
                checked={bulk}
                onChange={this._updateBulk}
              />
              {bulk?<Subheader primaryText='WARNING: You wont be able to see any results! This is meant for local use only.' inset/>:''}
              {!groupresults && !bulk ?
                <Subheader primaryText="(Will split files & subtyping methods into separate results)" inset />
              : ''}
              <Checkbox
                id="serotype"
                name="check serotype"
                checked={serotype}
                onChange={this._updateSerotype}
                label="Serotype"
              />
              <Checkbox
                id="vf"
                name="check vf"
                checked={vf}
                onChange={this._updateVf}
                label="Virulence Factors"
              />
              <TextField
                id="pi"
                value={pi}
                onChange={this._updatePi}
                helpText="Percent Identity for BLAST"
              />

            </div>
            <div className="md-cell md-cell--12">
              <h5>RGI (CARD) Analysis</h5>
              <Checkbox
                id="amr"
                name="check amr"
                checked={amr}
                onChange={this._updateAmr}
                label="Antimicrobial Resistance"
              />
              {amr ?
                <Subheader primaryText="(Note: AMR increases run-time by several minutes per file)" inset />
              : ''}
              <Divider />
            </div>
            <div className="md-cell md-cell--12">

              <h5>Phylotyper Subtyping Analysis</h5>

              {/* <Subheader primaryText="(Phylotyper requires VF and disables grouping results)" inset/> */}

              <Checkbox
                id="stx1"
                name="check stx1"
                checked={stx1}
                onChange={this._updateStx1}
                label="Shiga-toxin 1 Subtype"
              />

              <Checkbox
                id="stx2"
                name="check stx2"
                checked={stx2}
                onChange={this._updateStx2}
                label="Shiga-toxin 2 Subtype"
              />

              <Checkbox
                id="eae"
                name="check eae"
                checked={eae}
                onChange={this._updateEae}
                label="Intimin Subtype"
              />

              <TextField
                id="prob"
                value={prob}
                onChange={this._updateProb}
                helpText="Probability threshold for subtype assignment in Phylotyper"
              />

            </div>
            <div className="md-cell md-cell--12">

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
                  id={f.name}
                />
              )) : ''}
            </div>
          </form> :
          // if results are grouped, display the Loading page
          // else, results are separate and display the JobsList cards page
          (!uploading?(!groupresults?
            <Redirect to={RESULTS} />:
            <Loading jobId={this.state.jobId} />
          ):"")
        }
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    jobs: state.jobs,
    ...ownProps
  }
}

Subtyping = withRouter(connect(
  mapStateToProps
)(Subtyping))

Subtyping = connect()(Subtyping)

export default Subtyping
