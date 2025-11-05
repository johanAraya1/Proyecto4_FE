import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import gameGridStyles from '../../styles/GameGrid.styles';

const GameGrid = ({
  ingredientGrid,
  playerPositions,
  selectedPiece,
  possibleMoves,
  handleCellPress
}) => {
  // Generate unique keys for grid positions
  const generateRowKey = (row, index) => `gamerow_${index}_${row.length}`;
  const generateCellKey = (ingredient, row, col) => 
    `cell_${row}_${col}_${ingredient.emoji}_${ingredient.text}_${ingredient.color}`;

  return (
    <View style={gameGridStyles.gameGrid}>
      {ingredientGrid.map((row, rowIndex) => (
        <View key={generateRowKey(row, rowIndex)} style={gameGridStyles.gridRow}>
          {row.map((ingredient, colIndex) => {
            const isSelected =
              selectedPiece &&
              selectedPiece.row === rowIndex &&
              selectedPiece.col === colIndex;
            const isPossibleMove = possibleMoves.some(
              (move) => move.row === rowIndex && move.col === colIndex
            );
            const player1Here =
              playerPositions.player1.row === rowIndex &&
              playerPositions.player1.col === colIndex;
            const player2Here =
              playerPositions.player2.row === rowIndex &&
              playerPositions.player2.col === colIndex;
            const bothPlayersHere = player1Here && player2Here;
            return (
              <TouchableOpacity
                key={generateCellKey(ingredient, rowIndex, colIndex)}
                style={[
                  gameGridStyles.gridCell,
                  isSelected && gameGridStyles.selectedCell,
                  isPossibleMove && gameGridStyles.possibleMoveCell,
                ]}
                onPress={() => handleCellPress(rowIndex, colIndex)}
              >
                <View style={[gameGridStyles.ingredientBackground, { backgroundColor: ingredient.color }]} />
                <View style={gameGridStyles.ingredientContainer}>
                  <Text style={gameGridStyles.ingredientEmoji}>{ingredient.emoji}</Text>
                  <Text style={gameGridStyles.ingredientText}>{ingredient.text}</Text>
                </View>
                {player1Here && (
                  <View
                    style={[
                      gameGridStyles.playerPiece,
                      gameGridStyles.player1Piece,
                      isSelected && gameGridStyles.selectedPiece,
                      bothPlayersHere && gameGridStyles.overlappedPiece1,
                    ]}
                  >
                    <Text style={gameGridStyles.pieceText}>1</Text>
                  </View>
                )}
                {player2Here && (
                  <View
                    style={[
                      gameGridStyles.playerPiece,
                      gameGridStyles.player2Piece,
                      bothPlayersHere && gameGridStyles.overlappedPiece2,
                    ]}
                  >
                    <Text style={gameGridStyles.pieceText}>2</Text>
                  </View>
                )}
                {isPossibleMove && (
                  <View style={gameGridStyles.possibleMoveIndicator} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
};



export default GameGrid;
