import React from 'react';
import { VictoryScatter, VictoryChart, VictoryAxis, VictoryTooltip, VictoryLabel } from 'victory';

import classes from './GameChart.module.scss';

const gameChart = (props) => {

    let data = [...props.data];

    data.map(item => { item.x = item.weight; item.y = item.playingTime;});

    console.log(data);

    return (
        <div className={classes.chartContainer}>
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
                tickFormat={(x) => (`${props.convert(x)}`)}
                />    
                <VictoryScatter
                name="dot"
                size={(datum, active) => active ? 3 : 2}
                eventKey={(datum) => datum.id}
                labels={(datum) => datum.title}
                labelComponent={<VictoryTooltip/>}
                data={data}
                externalEventMutations={props.mutations}
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
    )
}

export default gameChart;