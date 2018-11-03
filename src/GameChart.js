import React from 'react';
import { VictoryScatter, VictoryChart, VictoryAxis, VictoryTooltip, VictoryLabel } from 'victory';

let Parser = require('fast-xml-parser');
let gameData = {};

export class GameChart extends React.Component {
    constructor(props) {
        super(props);    

        this.state = {
            /*  Unfortunately, the BGG API does not support returning a list of games by category,
                or even a list of top ranked games, so I hard-coded these IDs.
                I also hard-coded the titles just so this array is meaningful to anyone who reads it. */
            chartData: [
                {x: 1, y: 1, gameid: 144733, title: 'Russian Railroads' },
                {x: 1, y: 1, gameid: 14996, title: 'Ticket To Ride: Europe'},
                {x: 1, y: 1, gameid: 17133, title: 'Railways of the World'},
                {x: 1, y: 1, gameid: 31627, title: 'Ticket to Ride: Nordic Countries'},  
                {x: 1, y: 1, gameid: 27833, title: 'Steam'},
                {x: 1, y: 1, gameid: 4098, title: 'Age of Steam'},
                {x: 1, y: 1, gameid: 9209, title: 'Ticket To Ride'},  
                {x: 1, y: 1, gameid: 421, title: '1830: Railways & Robber Barons'},
                {x: 1, y: 1, gameid: 21348, title: 'Ticket To Ride: Märklin'},  
                {x: 1, y: 1, gameid: 158899, title: 'Colt Express'},
                {x: 1, y: 1, gameid: 206941, title: 'First Class: All Aboard the Orient Express!'},  
                {x: 1, y: 1, gameid: 119432, title: 'Snowdonia'},  
                {x: 1, y: 1, gameid: 31730, title: 'Chicago Express'},  
                {x: 1, y: 1, gameid: 121408, title: 'Trains'}, 
                {x: 1, y: 1, gameid: 17405, title: '1846: The Race for the Midwest'}, 
                {x: 1, y: 1, gameid: 94, title: 'Union Pacific'}, 
                {x: 1, y: 1, gameid: 207691, title: 'Railroad Revolution'}, 
                {x: 1, y: 1, gameid: 157001, title: 'Trains: Rising Sun'}, 
                {x: 1, y: 1, gameid: 221318, title: 'Whistle Stop'},   
                {x: 1, y: 1, gameid: 423, title: '1856: Railroading in Upper Canada from 1856'}, 
                {x: 1, y: 1, gameid: 2842, title: 'TransAmerica'},  
                {x: 1, y: 1, gameid: 168, title: 'Empire Builder'},  
                {x: 1, y: 1, gameid: 37387, title: 'Steel Driver'},  
                {x: 1, y: 1, gameid: 24773, title: 'On the Underground'},  
                {x: 1, y: 1, gameid: 204, title: 'Stephenson\'s Rocket'},   
                {x: 1, y: 1, gameid: 157, title: 'Eurorails'},   
                {x: 1, y: 1, gameid: 166571, title: 'Tramways'},   
                {x: 1, y: 1, gameid: 23540, title: '1889: History of Shikoku Railways'},   
                {x: 1, y: 1, gameid: 41749, title: 'American Rails'},
                {x: 1, y: 1, gameid: 138704, title: 'Northern Pacific'}                
            ],
            gameDetails: [],
            externalMutations: undefined /* Used by Victory tables to respond to events from outside elements */
        } 
    }
      
    componentDidMount() {
        let gameIDs = this.state.chartData.map( (a, i) => `${a.gameid}`).join(',');

        fetch('https://www.boardgamegeek.com/xmlapi2/thing?stats=1&id=' + gameIDs)
            .then(response => response.text())
            .then(text => {
            const options = {
                ignoreAttributes : false,
                parseAttributeValue : true,
                attributeNamePrefix : "_" 
            }

            /* The BGG API returns XML, so it needs to be converted to JSON */
            gameData = Parser.parse(text, options);

            this.setState({ gameDetails: gameData.items.item })         

            let cd = this.state.chartData;

            /* I'm pulling only the details needed for the chart (playing time and average weight) */
            cd.forEach( (game) => {
                this.state.gameDetails.forEach( (item) => {
                    if (game.gameid === item._id) {
                        game.x = item.statistics.ratings.averageweight._value;
                        game.y = item.playingtime._value;
                        this.setState({ chartData: cd })
                    }
                })
            })
        });
    } 

    convertMinsToHrsMins = (mins) => {
        let h = Math.floor(mins / 60);
        let m = mins % 60;
        m = m < 10 ? '0' + m : m;
        return `${h}:${m}`;
    }

    /* These show and hide the tooltips on the Victory chart when the title is hovered in the table. */
    onHighlight = (key) => {
        const gameid = String(key);

        this.setState({
            externalMutations: [{
                childName: "data",
                target: "labels",
                eventKey: gameid,
                mutation: () => ({ active: true })
            }]
        });
    }

    onResetHighlight = (key) => {
        const gameid = String(key);

        this.setState({
            externalMutations: [{
                childName: "data",
                target: "labels",
                eventKey: gameid,
                mutation: () => ({ active: false })
            }]
        });
    }

    /* Placeholder for possible future functionality */
    onSort = (event, key) => {
        /*
        TODO: Need to pull object values into arrays to make this table sortable

        const data = this.state.gameDetails;
        data.sort((a,b) => a[key].localeCompare(b[key]));
        this.setState({ gameDetails: data});
        */
    }

    render() {
        let newDetails = this.state.gameDetails;

        return (
            <article>
                <div className="chart-container">
                    <VictoryChart
                    domain={{ x: [1,5], y: [0,400] }}
                    >
                        <VictoryLabel text="Playing time" x={5} y={140} angle="-90" textAnchor="middle"/>
                        <VictoryLabel text="Weight" x={225} y={290} textAnchor="middle"/>
                        
                        <VictoryAxis
                        tickValues={[1, 2, 3, 4, 5]}
                        />                    
                        <VictoryAxis
                        dependentAxis
                        tickValues={[60, 120, 180, 240, 300, 360 ]}
                        tickFormat={(x) => (`${this.convertMinsToHrsMins(x)}`)}
                        />    
                        <VictoryScatter
                        name="dot"
                        size={(datum, active) => active ? 3 : 2}
                        eventKey={(datum) => datum.gameid}
                        labels={(datum) => datum.title}
                        labelComponent={<VictoryTooltip/>}
                        data={this.state.chartData}
                        externalEventMutations={this.state.externalMutations}
                        events={[
                            {
                                target: "data",
                                eventHandlers: {
                                    onMouseOver: () => {
                                        return [
                                            {
                                                target: "labels",
                                                mutation: () => {
                                                    return { active: true };

                                                }
                                            }
                                        ];
  
                                    },
  
                                    onMouseOut: () => {
                                        return [
                                            {
                                                target: "labels",
                                                mutation: () => {
                                                    return { active: false };
                                                }
                                            }
                                        ];
                                    }
                                }
                            }
                          ]}                        
                        />
                    </VictoryChart>
                </div>
                {/* Note that sorting is not yet functional */}
                <table className="sortable-table">
                    <thead>
                        <tr>
                            <th onClick={e => this.onSort(e, 'rank')}>Rank</th>
                            <th onClick={e => this.onSort(e, 'title')}>Title</th>
                            <th onClick={e => this.onSort(e, 'mechanics')}>Mechanics</th>
                        </tr>
                    </thead>
                    <tbody>
                        {newDetails.map((game, index) => {
                            let gameName='';
                            let mechanics = '';

                            /* Ideally this would get replaced by a full regex, but for now these are the only special characters 
                               we need to worry about
                            */
                            if(Array.isArray(game.name)) {
                                gameName = game.name[0]._value.replace('&#039;', '\'').replace('&amp;', '&');
                            } else {
                                gameName = game.name._value.replace('&#039;', '\'').replace('&amp;', '&');;
                            }

                            game.link.forEach( (item) => {
                                if (item._type==='boardgamemechanic') {
                                    mechanics = mechanics + item._value + ', ';
                                }
                            })

                            mechanics = mechanics.substring(0, mechanics.length-2);

                            return (
                                <tr key={index} data-item={game._id} data-dir="asc" onMouseOver={() => this.onHighlight(game._id)} onMouseOut={() => this.onResetHighlight(game._id)}>
                                    <td data-type="rank">{game.statistics.ratings.ranks.rank[0]._value}</td>
                                    <td data-type="title">{gameName} <a className="link-button" href={'https://www.boardgamegeek.com/boardgame/'+game._id}>&gt;</a></td>
                                    <td data-type="mechanics">{mechanics}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </article>
        );
    }
}