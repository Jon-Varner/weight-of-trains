import React from 'react';

import classes from './GameTable.module.scss';

const gameTable = (props) => {
    return (
        <table className="sortable-table">
            <thead>
                <tr>
                    <th onClick={e => props.sorted(e, 'rank')} data-direction='asc'>Rank</th>
                    <th onClick={e => props.sorted(e, 'title')} data-direction='asc'>Title</th>
                    <th onClick={e => props.sorted(e, 'mechanics')} data-direction='asc'>Mechanics</th>
                </tr>
            </thead>
            <tbody>
                {props.data.map((game, index) => {
                    return (
                        <tr 
                            key={index} 
                            data-item={game.id} 
                            onMouseOver={() => props.mousedOver(game.id)} 
                            onMouseOut={() => props.mousedOut(game.id)}>
                            <td data-type="rank">{game.rank}</td>
                            <td data-type="title">{game.title} <a className={classes.linkButton} href={'https://www.boardgamegeek.com/boardgame/'+game.id}>&gt;</a></td>
                            <td data-type="mechanics">{game.mechanics}</td>
                        </tr>
                    );
                })}
            </tbody>
        </table>

    )
}

export default gameTable;