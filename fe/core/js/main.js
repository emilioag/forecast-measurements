var itemsContent = {
    'data': [
        {
            'link': '#upload-form',
            'icon': 'icon fa fa-upload fa-2',
            'text': 'Info'
        },
        {
            'link': '#chart-form',
            'icon': 'icon fa fa-area-chart fa-2',
            'text': 'Chart'
        }
    ]
};

var granularityModel = [
    {value:'daily', label:'Daily'},
    {value:'monthly', label:'Monthly'},
    {value:'weekly', label:'Weekly'},
];

var MenuItem = React.createClass({
    render: function () {
        var selector, text;
        if (this.props.link != '#'){ // not menu icon
            text = <span>{this.props.text}</span>
            selector = <div className="triangle"></div>
        }
        return <li className={ this.props.class }>
            <a href={ this.props.link }>
                <i className={ this.props.icon } aria-hidden="true"></i>
                { text }
            </a>
            { selector}
        </li>;
    }
});

var Menu = React.createClass({
    getInitialState : function() {
        return itemsContent
    },
    render: function () {
        var elements;
        elements = this.state.data.map(function(x) {
            return <MenuItem class={ x.class } link={ x.link } icon={ x.icon } text={ x.text } />
        }, this);
        return <ul className="tabs">{ elements }</ul>;
    }
});

var MultiSelect = React.createClass({
    getInitialState: function() {
        return {
            signals: {},
            checked: 0,
            selected: []
        };
    },
    componentDidMount: function() {
        this.serverRequest = fetch( this.props.api )
            .then(response => response.json())
            .then(data => this.setState({ signals: data }));
    },
    componentWillReceiveProps: function (nextProps){
        if (nextProps.reload){
            nextProps.reload = false;
            this.props.reload = false;
            this.serverRequest = fetch( this.props.api )
                .then(response => response.json())
                .then(data => this.setState({ signals: data }));
        }
    },
    componentWillUnmount: function() {
        this.serverRequest.abort();
    },
    handleClick: function (e) {
        var self = this,
            signals = self.state.signals,
            selected;
        if ( signals[e.target.name].checked ){
            self.state.checked -= 1;
            signals[e.target.name].checked = false
        } else {
            if ( self.state.checked <  self.props.max ) {
                self.state.checked += 1;
                signals[e.target.name].checked = true
            } else {
                e.target.checked = false;
            }
        }
        selected = Object.keys(self.state.signals).filter(function(key){
            if ( self.state.signals[key].checked ){
                return key;
            }
        });
        self.setState({
            signals: signals,
            selected: selected
        });
    },
    render: function () {
        var self = this;
        var options = Object.keys(this.state.signals).map(function ( item ) {
            return  <div>
                        <input  type="checkbox"
                                name={ item }
                                value={ item }
                                onClick={ self.handleClick }
                                disabled={self.state.checked >= self.props.max && !self.state.signals[item]['checked']}/>
                        <span>&nbsp; { item.charAt(0).toUpperCase() + item.slice(1).toLowerCase() }</span>
                    </div>;
        });

        self.props.onChange(self.state.selected);
        return  <div className='multi-select'>
                    { options }
                </div>;
    }
});

var MySelect = React.createClass({
    getInitialState: function () {
        var model = [],
            currentItem = { value: '', label: '' };
        if ( this.props.model !== undefined && this.props.model.length > 0) {
            model = this.props.model;
            currentItem = this.props.model[0].value;
        }
        return {
            model: model,
            currentItem: currentItem,
            spinner: false
        }
    },
    getDataFromDB: function () {
        var self = this,
            currentItem;
        this.serverRequest = fetch( this.props.api )
            .then(response => response.json())
            .then(function (data) {
                    var key = Object.keys(data)[0];
                    var model = data[key].map(function (item) {
                        return {'value': item, 'label': item}
                    });
                    self.setState({ model: model, currentItem: model.length == 0 ? '': model[0].value , spinner: false});
                }
            );
    },
    componentDidMount: function() {
        this.props.api === undefined || this.getDataFromDB();
    },
    componentWillReceiveProps: function (nextProps){
        this.props.api === undefined || !nextProps.reload || this.getDataFromDB();
    },
    handleChange: function (e) {
        this.setState({ currentItem: e.target.value });
    },
    render: function () {
        var self = this,
            options = self.state.model.map(function ( item ) {
                return <option value={ item.value }>{ item.label }</option>
            });
        self.props.current(self.state.currentItem);
        return  <select type="text" className="form-control" aria-describedby="basic-addon1" onChange={ self.handleChange }>
                    { options }
                </select>
    }
});

var ChartPlace = React.createClass({

    getInitialState: function() {
        return {
            startDate: moment(),
            endDate: moment().add(1, 'days'),
            signals: [],
            granularityModel: granularityModel,
            reload: false
        };
    },
    sensor: '',
    granularity: '',
    componentWillReceiveProps: function (nextProps) {
        if ( nextProps.reload ) this.setState({ reload: true });
    },
    componentWillUnmount: function() {
        this.serverRequest.abort();
    },
    componentWillUnmount: function() {
        this.serverRequest.abort();
    },
    handleChangeStart: function(date) {
        this.setState({ startDate: date, reload: false });
    },
    handleChangeEnd: function(date) {
        this.setState({ endDate: date, reload: false });
    },
    handleClick: function(){
        var url = "api/chart";
        url += "?start_date=" + this.state.startDate.toISOString()
        url += "&end_date=" + this.state.endDate.toISOString();
        url += "&sensor=" + this.sensor;
        url += "&granularity=" + this.granularity;
        this.state.signals.forEach(function ( signal ) {
            url += "&signal_id=" + signal;
        });
        this.serverRequest = fetch(url)
            .then(response => response.json())
            .then(function (data){
                revenueChart.chartType(data['type']);
                revenueChart.setJSONData(data['dataset']);
            }.bind())
    },
    handleChangeSignal: function(s) {
        if ( this.state.signals.length != s.length ) this.setState({ signals: s, reload: false });
    },
    handleCurrentSensor: function ( currentItem ) {
        this.sensor = currentItem;
    },
    handleCurrentGranularity: function ( currentItem ) {
        this.granularity = currentItem;
    },
    render: function() {
        var self = this;
        return  <div>
                    <div className="row">
                        <div className="col-xs-3">
                            <span>Start Date &nbsp;</span>
                        </div>
                        <div className="col-xs-3">
                            <DatePicker
                              className="form-control"
                              selected={ this.state.startDate }
                              startDate={ this.state.startDate }
                              endDate={ this.state.endDate }
                              onChange={ this.handleChangeStart } />
                        </div>
                        <div className="col-xs-3">
                            <span>End Date &nbsp;</span>
                        </div>
                        <div className="col-xs-3">
                            <div className="form-group">
                                <DatePicker
                                  className="form-control"
                                  selected={ this.state.endDate }
                                  startDate={ this.state.startDate }
                                  endDate={ this.state.endDate }
                                  onChange={ this.handleChangeEnd } />
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-xs-6">
                            <span>Granularity &nbsp;</span>
                        </div>
                        <div className="col-xs-6">
                            <div className="form-group">
                                <MySelect
                                    model={ this.state.granularityModel }
                                    current={ this.handleCurrentGranularity }>
                                </MySelect>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-xs-6">
                            <span>Sensor &nbsp;</span>
                        </div>
                        <div className="col-xs-6">
                            <div className="form-group">
                                <MySelect
                                    reload={ this.state.reload }
                                    api='api/sensors'
                                    current={ this.handleCurrentSensor }>
                                </MySelect>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-xs-6">
                            <span>Signals &nbsp;</span>
                        </div>
                        <div className="col-xs-6">
                            <MultiSelect 
                                onChange={ this.handleChangeSignal }
                                max='2'
                                api='api/signals'
                                reload={ this.state.reload }></MultiSelect>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-xs-12">
                            <a className="btn btn-info pull-right" onClick={ this.handleClick }>
                                <i className="fa fa-area-chart"></i>&nbsp;Load Chart&nbsp;
                            </a>
                        </div>
                    </div>
                    <hr/>
                </div>

    }
});

var UploadForm = React.createClass({
    getInitialState: function() {
        return {
            data: new FormData(),
            list: [],
            saved: '',
            recieved: false,
            spinner: false
        };
    },
    handleClick: function ( e ) {
        var self = this,
            request = new XMLHttpRequest();
        self.setState({
            spinner: true
        });
        request.open("POST", 'api/uploadCSV');
        request.onload = function ( data ) {
            self.setState({
                data: new FormData(),
                list: [],
                saved: 'Files Saved',
                recieved: true,
                spinner: false
            });
        };
        request.send(this.state.data);
        
    },
    handleChange: function( e ) {
        var data = this.state.data,
            list = this.state.list;
        Object.keys( e.target.files ).forEach(function ( i ){
            data.append('uploadfile', e.target.files[i]);
            list[list.length] = {
                'filename': e.target.files[i].name,
                'size': e.target.files[i].size,
                'type': e.target.files[i].type
            }
        });
        this.setState( { data: data, list: list } );
    },
    handleClickFile: function ( e ) {
        document.getElementById("files_1").click();
    },
    render: function () {
        var self = this,
            list,
            classSave = this.state.list.length > 0 ? "btn btn-info": "btn btn-info disabled",
            spinner = '';
        list = this.state.list.map(function ( item ) {
            return <li><b>filename:&nbsp;</b>{ item.filename },&nbsp;&nbsp;<b>size:&nbsp;</b>{ item.size },&nbsp;&nbsp;<b>type:&nbsp;</b>{ item.type },&nbsp;&nbsp;</li>;
        });
        if ( self.state.recieved ) {
            this.setState({ recieved: false });
            this.props.onChange(true);
        }
        if ( self.state.spinner ) {
            spinner = <span><i className="fa fa-spinner fa-spin fa-2x fa-fw"></i><span className="sr-only"></span></span>;
        } else {
            spinner = '';
        }
        return  <form>
                    <a className="btn btn-info" onClick={ this.handleClickFile }>
                        <i className="fa fa-folder-open" aria-hidden="true"></i>&nbsp;Load files
                    </a>
                    &nbsp;
                    <a className={ classSave } onClick={ this.handleClick }>
                        <i className="fa fa-floppy-o" aria-hidden="true"></i>&nbsp;Save
                    </a>&nbsp;&nbsp;{ spinner }<br/>
                    <input type="file" id="files_1" name="uploadfile" multiple onChange={ this.handleChange } />
                    <ul>{ list }</ul>
                    <h1>{ this.state.saved }</h1>
                    <br />
                </form>
    }
});

var Container = React.createClass({
    getInitialState: function() {
        return {
            reload: false
        };
    },
    handleOnChange: function (a) {
        this.setState({reload: true});
    },
    componentDidMount: function() {
        this.setState({reload: false});
    },
    render: function () {
        return <section className="wrapper">
                    <Menu></Menu>
                    <div className="clr"></div>
                    <section className="block">
                        <article id="upload-form">
                            <h1> Upload file </h1>
                            <UploadForm onChange={ this.handleOnChange }/>
                        </article>
                        <article id="chart-form">
                            <h1> Draw chart </h1>
                            <ChartPlace reload={ this.state.reload } api='api/chart/'/>
                            <div id="chart-container"></div>
                        </article>
                    </section>
                </section>
    }
});


ReactDOM.render(<Container />, document.getElementById("container"));
var revenueChart = new FusionCharts({
    id: "revenue-chart",
    type: 'line',
    renderAt: 'chart-container',
    width: '100%',
    height: 400,
    dataFormat: 'json',
    dataSource: {}
}).render();

$(function(){
    $('ul.tabs li:first').addClass('active');
    $('.block article').hide();
    $('.block article:first').show();
        $('ul.tabs li').on('click',function(){
            var clickOnMenuIcon = $.inArray("icon", $(this)[0].classList) >= 0,
                menuIsCollapsed = $.inArray("responsive", $('.tabs')[0].classList) >= 0;
            if (clickOnMenuIcon || menuIsCollapsed) {
                $('.tabs')[0].classList.toggle("responsive");
            }
            $('ul.tabs li').removeClass('active');
            $(this).addClass('active')
            $('.block article').hide();
            var activeTab = $(this).find('a').attr('href');
            $(activeTab).show();
            return false;
        });
})