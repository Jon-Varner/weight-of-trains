import React, { Component } from 'react';

import GameChart from '../../components/GameChart/GameChart';
import GameTable from '../../components/GameTable/GameTable';

/*  Unfortunately, the BGG API does not support returning a list of games by category,
or even a list of top ranked games, so I hard-coded these IDs.
I also hard-coded the titles just so this array is meaningful to anyone who reads it. */
let gameBasics = [
    {gameid: 144733, title: 'Russian Railroads' },
    {gameid: 14996, title: 'Ticket To Ride: Europe'},
    {gameid: 17133, title: 'Railways of the World'},
    {gameid: 31627, title: 'Ticket to Ride: Nordic Countries'},  
    {gameid: 27833, title: 'Steam'},
    {gameid: 4098, title: 'Age of Steam'},
    {gameid: 9209, title: 'Ticket To Ride'},  
    {gameid: 421, title: '1830: Railways & Robber Barons'},
    {gameid: 21348, title: 'Ticket To Ride: Märklin'},  
    {gameid: 158899, title: 'Colt Express'},
    {gameid: 206941, title: 'First Class: All Aboard the Orient Express!'},  
    {gameid: 119432, title: 'Snowdonia'},  
    {gameid: 31730, title: 'Chicago Express'},  
    {gameid: 121408, title: 'Trains'}, 
    {gameid: 17405, title: '1846: The Race for the Midwest'}, 
    {gameid: 94, title: 'Union Pacific'}, 
    {gameid: 207691, title: 'Railroad Revolution'}, 
    {gameid: 157001, title: 'Trains: Rising Sun'}, 
    {gameid: 221318, title: 'Whistle Stop'},   
    {gameid: 423, title: '1856: Railroading in Upper Canada from 1856'}, 
    {gameid: 2842, title: 'TransAmerica'},  
    {gameid: 168, title: 'Empire Builder'},  
    {gameid: 37387, title: 'Steel Driver'},  
    {gameid: 24773, title: 'On the Underground'},  
    {gameid: 204, title: 'Stephenson\'s Rocket'},   
    {gameid: 157, title: 'Eurorails'},   
    {gameid: 166571, title: 'Tramways'},   
    {gameid: 23540, title: '1889: History of Shikoku Railways'},   
    {gameid: 41749, title: 'American Rails'},
    {gameid: 138704, title: 'Northern Pacific'}                
    ];

export class Layout extends Component {
    state = {
        gameDetails: [],
        externalMutations: undefined /* Used by Victory charts to respond to events from outside elements */
    } 

    componentDidMount() {
        let gameIDs = gameBasics.map( (a, i) => `${a.gameid}`).join(',');

        fetch('https://www.boardgamegeek.com/xmlapi2/thing?stats=1&id=' + gameIDs)
            .then(response => response.text())
            .then(text => {
            const options = {
                ignoreAttributes : false,
                parseAttributeValue : true,
                attributeNamePrefix : "_" 
            }

            /* The BGG API returns XML, so it needs to be converted to JSON */
            let Parser = require('fast-xml-parser');
            let gameData = Parser.parse(text, options);

            const arr = Object.keys(gameData.items.item).map((key) => gameData.items.item[key]);

            const reduced = [];

            arr.forEach( (game, index) => {
                let obj = {};
                let title='';
                let rank='';
                let mechanics = '';

                /* Ideally this would get replaced by a full regex, but for now these are the only special characters 
                    we need to worry about
                */
                if(Array.isArray(game.name)) {
                    title = game.name[0]._value.replace('&#039;', '\'').replace('&amp;', '&');
                } else {
                    title = game.name._value.replace('&#039;', '\'').replace('&amp;', '&');;
                }

                if(Array.isArray(game.statistics.ratings.ranks.rank)) {
                    rank = game.statistics.ratings.ranks.rank[0]._value;
                } else {
                    rank = game.statistics.ratings.ranks.rank._value;
                }

                game.link.forEach( (item) => {
                    if (item._type==='boardgamemechanic') {
                        mechanics = mechanics + item._value + ', ';
                    }
                })

                 obj.id = game._id;
                 obj.rank = rank;
                 obj.title = title;
                 obj.mechanics = mechanics.substring(0, mechanics.length-2);
                 obj.weight = game.statistics.ratings.averageweight._value;
                 obj.playingTime = game.playingtime._value;
                 
                 reduced.push(obj);

            })

            this.setState({ gameDetails: reduced});            
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
        console.log('highlight ' + gameid);
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

    onSort = (event, key) => {
        const arr = this.state.gameDetails;
        const dir = event.currentTarget.dataset.direction;

        if (dir==='asc') {
            arr.sort((a,b) => {
                if (isNaN(a[key])) {
                    return a[key].localeCompare(b[key]);
                } else {
                    return a[key]-b[key];
                }
            });
            event.target.setAttribute('data-direction', 'desc');
        } else {
            arr.sort((a,b) => {
                if (isNaN(b[key])) {
                    return b[key].localeCompare(a[key]);
                } else {
                    return b[key]-a[key];
                }
            });
            event.target.setAttribute('data-direction', 'asc');
        }
        this.setState({ gameDetails: arr});
    }

    render() {
        return (
            <article>
                <GameChart 
                    data={this.state.gameDetails} 
                    mutations={this.state.externalMutations} 
                    convert={this.convertMinsToHrsMins} 
                />
                <GameTable 
                    data={this.state.gameDetails} 
                    sorted={this.onSort} 
                    mousedOver={this.onHighlight} 
                    mousedOut={this.onResetHighlight} 
                />
            </article>
        );
    }
}