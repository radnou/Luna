class ZodiacCalculator {
  static String getZodiacSign(DateTime date) {
    int day = date.day;
    int month = date.month;
    
    if ((month == 3 && day >= 21) || (month == 4 && day <= 19)) {
      return 'Aries';
    } else if ((month == 4 && day >= 20) || (month == 5 && day <= 20)) {
      return 'Taurus';
    } else if ((month == 5 && day >= 21) || (month == 6 && day <= 20)) {
      return 'Gemini';
    } else if ((month == 6 && day >= 21) || (month == 7 && day <= 22)) {
      return 'Cancer';
    } else if ((month == 7 && day >= 23) || (month == 8 && day <= 22)) {
      return 'Leo';
    } else if ((month == 8 && day >= 23) || (month == 9 && day <= 22)) {
      return 'Virgo';
    } else if ((month == 9 && day >= 23) || (month == 10 && day <= 22)) {
      return 'Libra';
    } else if ((month == 10 && day >= 23) || (month == 11 && day <= 21)) {
      return 'Scorpio';
    } else if ((month == 11 && day >= 22) || (month == 12 && day <= 21)) {
      return 'Sagittarius';
    } else if ((month == 12 && day >= 22) || (month == 1 && day <= 19)) {
      return 'Capricorn';
    } else if ((month == 1 && day >= 20) || (month == 2 && day <= 18)) {
      return 'Aquarius';
    } else {
      return 'Pisces';
    }
  }
  
  static String getZodiacElement(String sign) {
    switch (sign) {
      case 'Aries':
      case 'Leo':
      case 'Sagittarius':
        return 'Fire';
      case 'Taurus':
      case 'Virgo':
      case 'Capricorn':
        return 'Earth';
      case 'Gemini':
      case 'Libra':
      case 'Aquarius':
        return 'Air';
      case 'Cancer':
      case 'Scorpio':
      case 'Pisces':
        return 'Water';
      default:
        return 'Unknown';
    }
  }
  
  static String getZodiacSymbol(String sign) {
    switch (sign) {
      case 'Aries':
        return '♈';
      case 'Taurus':
        return '♉';
      case 'Gemini':
        return '♊';
      case 'Cancer':
        return '♋';
      case 'Leo':
        return '♌';
      case 'Virgo':
        return '♍';
      case 'Libra':
        return '♎';
      case 'Scorpio':
        return '♏';
      case 'Sagittarius':
        return '♐';
      case 'Capricorn':
        return '♑';
      case 'Aquarius':
        return '♒';
      case 'Pisces':
        return '♓';
      default:
        return '?';
    }
  }
  
  static Map<String, dynamic> getZodiacTraits(String sign) {
    final traits = {
      'Aries': {
        'positive': ['Courageous', 'Confident', 'Enthusiastic', 'Optimistic'],
        'negative': ['Impatient', 'Impulsive', 'Short-tempered'],
        'element': 'Fire',
        'ruling_planet': 'Mars',
      },
      'Taurus': {
        'positive': ['Reliable', 'Patient', 'Practical', 'Devoted'],
        'negative': ['Stubborn', 'Possessive', 'Uncompromising'],
        'element': 'Earth',
        'ruling_planet': 'Venus',
      },
      'Gemini': {
        'positive': ['Gentle', 'Affectionate', 'Curious', 'Adaptable'],
        'negative': ['Nervous', 'Inconsistent', 'Indecisive'],
        'element': 'Air',
        'ruling_planet': 'Mercury',
      },
      'Cancer': {
        'positive': ['Tenacious', 'Loyal', 'Emotional', 'Sympathetic'],
        'negative': ['Moody', 'Pessimistic', 'Suspicious'],
        'element': 'Water',
        'ruling_planet': 'Moon',
      },
      'Leo': {
        'positive': ['Creative', 'Passionate', 'Generous', 'Warm-hearted'],
        'negative': ['Arrogant', 'Stubborn', 'Self-centered'],
        'element': 'Fire',
        'ruling_planet': 'Sun',
      },
      'Virgo': {
        'positive': ['Loyal', 'Analytical', 'Kind', 'Hardworking'],
        'negative': ['Shyness', 'Worry', 'Overly critical'],
        'element': 'Earth',
        'ruling_planet': 'Mercury',
      },
      'Libra': {
        'positive': ['Cooperative', 'Diplomatic', 'Gracious', 'Fair-minded'],
        'negative': ['Indecisive', 'Avoids confrontations', 'Self-pity'],
        'element': 'Air',
        'ruling_planet': 'Venus',
      },
      'Scorpio': {
        'positive': ['Resourceful', 'Brave', 'Passionate', 'Stubborn'],
        'negative': ['Distrusting', 'Jealous', 'Secretive'],
        'element': 'Water',
        'ruling_planet': 'Pluto',
      },
      'Sagittarius': {
        'positive': ['Generous', 'Idealistic', 'Great sense of humor'],
        'negative': ['Promises more than can deliver', 'Impatient'],
        'element': 'Fire',
        'ruling_planet': 'Jupiter',
      },
      'Capricorn': {
        'positive': ['Responsible', 'Disciplined', 'Self-control'],
        'negative': ['Know-it-all', 'Unforgiving', 'Condescending'],
        'element': 'Earth',
        'ruling_planet': 'Saturn',
      },
      'Aquarius': {
        'positive': ['Progressive', 'Original', 'Independent', 'Humanitarian'],
        'negative': ['Runs from emotional expression', 'Temperamental'],
        'element': 'Air',
        'ruling_planet': 'Uranus',
      },
      'Pisces': {
        'positive': ['Compassionate', 'Artistic', 'Intuitive', 'Gentle'],
        'negative': ['Fearful', 'Overly trusting', 'Desire to escape reality'],
        'element': 'Water',
        'ruling_planet': 'Neptune',
      },
    };
    
    return traits[sign] ?? {};
  }
}